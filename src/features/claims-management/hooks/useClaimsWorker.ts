import { useState, useEffect, useCallback } from 'react';
import { FormattedClaim } from '../../../entities/claim/types';

interface RawClaim {
  id: number;
  number: string;
  amount: string;
  holder: string;
  policyNumber: string;
  status: string;
  incidentDate: string;
  createdAt: string;
  processingFee: string;
  insuredName: string;
  description: string;
}

interface WorkerState {
  isLoading: boolean;
  claims: FormattedClaim[]; // Current window of data (up to 2000 records for 2 chunks)
  totalRecords: number;
  hasData: boolean;
  error: string | null;
  loadedChunks: { start: number; end: number; data: FormattedClaim[] }[]; // Store chunk data
}

export function useClaimsWorker() {
  const [state, setState] = useState<WorkerState>({
    isLoading: false,
    claims: [], // Current window of 1000 records
    totalRecords: 1000000,
    hasData: false,
    error: null,
    loadedChunks: [],
  });

  // Load 1 chunk initially (1000 records)
  const loadAllData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      console.log(`🚀 Loading initial 1000 records...`);

      const response = await fetch(
        `http://localhost:8001/claims?_start=0&_limit=1000`
      );
      if (!response.ok) throw new Error('Failed to fetch initial claims');

      const rawClaims = await response.json();

      // Format claims
      const formattedClaims = rawClaims.map((claim: RawClaim) => ({
        ...claim,
        formattedClaimAmount: `$${parseFloat(claim.amount).toFixed(2)}`,
        formattedProcessingFee: `$${parseFloat(claim.processingFee).toFixed(2)}`,
        formattedTotalAmount: `$${(parseFloat(claim.amount) + parseFloat(claim.processingFee)).toFixed(2)}`,
        formattedIncidentDate: new Date(
          claim.incidentDate
        ).toLocaleDateString(),
        formattedCreatedDate: new Date(claim.createdAt).toLocaleDateString(),
      }));

      console.log(`✅ Loaded ${formattedClaims.length} records for initial UI`);

      // Update UI with initial chunk
      setState((prev) => ({
        ...prev,
        claims: formattedClaims, // 1000 records
        hasData: true,
        isLoading: false,
        loadedChunks: [
          { start: 0, end: formattedClaims.length - 1, data: formattedClaims },
        ],
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load initial claims',
      }));
    }
  }, []);

  // Load chunk for specific range (replace current chunk)
  const loadChunkForRange = useCallback(
    async (startIndex: number, limit: number): Promise<FormattedClaim[]> => {
      console.log(
        `🔄 Loading chunk for range ${startIndex}-${startIndex + limit - 1}`
      );

      try {
        const response = await fetch(
          `http://localhost:8001/claims?_start=${startIndex}&_limit=${limit}`
        );
        if (!response.ok) {
          console.error(
            `❌ API call failed: ${response.status} ${response.statusText}`
          );
          return [];
        }

        const rawClaims = await response.json();
        console.log(`✅ Received ${rawClaims.length} claims from API`);

        // Format claims
        const formattedClaims = rawClaims.map((claim: RawClaim) => ({
          ...claim,
          formattedClaimAmount: `$${parseFloat(claim.amount).toFixed(2)}`,
          formattedProcessingFee: `$${parseFloat(claim.processingFee).toFixed(2)}`,
          formattedTotalAmount: `$${(parseFloat(claim.amount) + parseFloat(claim.processingFee)).toFixed(2)}`,
          formattedIncidentDate: new Date(
            claim.incidentDate
          ).toLocaleDateString(),
          formattedCreatedDate: new Date(claim.createdAt).toLocaleDateString(),
        }));

        console.log(`🔧 Formatted ${formattedClaims.length} claims`);

        // Add new chunk to cache and update current display
        setState((prev) => {
          const newChunk = {
            start: startIndex,
            end: startIndex + formattedClaims.length - 1,
            data: formattedClaims,
          };

          // Add to loaded chunks, keeping up to 3 recent chunks, with new chunk at front
          let updatedChunks = [
            ...prev.loadedChunks.filter((c) => c.start !== startIndex),
            newChunk,
          ]; // Remove if exists, add new
          if (updatedChunks.length > 3) {
            updatedChunks = updatedChunks.slice(-3); // Keep only last 3 chunks
          }

          // Move the new chunk to the front so loadedChunks[0] is the current chunk
          const newChunkIndex = updatedChunks.findIndex(
            (c) => c.start === startIndex
          );
          if (newChunkIndex > 0) {
            const [currentChunk] = updatedChunks.splice(newChunkIndex, 1);
            updatedChunks.unshift(currentChunk);
          }

          console.log(
            `📊 State update: claims=${formattedClaims.length}, chunks=${updatedChunks.length}, currentChunkStart=${updatedChunks[0].start}`
          );

          return {
            ...prev,
            claims: formattedClaims, // Show new chunk
            loadedChunks: updatedChunks,
          };
        });

        console.log(
          `✅ Chunk ${startIndex}-${startIndex + limit - 1} loaded successfully`
        );

        return formattedClaims;
      } catch (error) {
        console.error('❌ Error loading chunk:', error);
        return [];
      }
    },
    []
  );

  // Switch to a chunk that's already loaded (for navigation within sliding window)
  const switchToLoadedChunk = useCallback((targetChunkStart: number) => {
    setState((prev) => {
      console.log(
        `🔍 switchToLoadedChunk called for ${targetChunkStart}, loadedChunks:`,
        prev.loadedChunks.map((c) => ({ start: c.start, hasData: !!c.data }))
      );

      const storedChunk = prev.loadedChunks.find(
        (chunk) => chunk.start === targetChunkStart && chunk.data
      );
      if (!storedChunk || !storedChunk.data) {
        console.log(
          `❌ Chunk ${targetChunkStart} not found in cache or no data, loadedChunks:`,
          prev.loadedChunks
        );
        return prev; // Chunk not found or no data
      }

      console.log(
        `🔄 Switched to cached chunk ${targetChunkStart}-${targetChunkStart + 999} (${storedChunk.data.length} records)`
      );

      const newState = {
        ...prev,
        claims: storedChunk.data, // Use stored data directly
        loadedChunks: [storedChunk], // Replace with just this chunk
      };

      console.log(
        `📊 switchToLoadedChunk state update: claims.length=${newState.claims.length}, loadedChunks[0].start=${newState.loadedChunks[0].start}`
      );

      return newState;
    });
  }, []);

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    // State
    ...state,

    // Actions
    loadChunkForRange,
    switchToLoadedChunk,
    loadAllData,
  };
}
