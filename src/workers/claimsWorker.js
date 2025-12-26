// Web Worker for loading and processing claims data

// Format a single claim
function formatClaim(claim) {
  return {
    ...claim,
    formattedClaimAmount: `$${parseFloat(claim.amount).toFixed(2)}`,
    formattedProcessingFee: `$${parseFloat(claim.processingFee).toFixed(2)}`,
    formattedTotalAmount: `$${(parseFloat(claim.amount) + parseFloat(claim.processingFee)).toFixed(2)}`,
    formattedIncidentDate: new Date(claim.incidentDate).toLocaleDateString(),
    formattedCreatedDate: new Date(claim.createdAt).toLocaleDateString(),
  };
}

// Load initial 1000 claims with cache busting
async function loadInitialClaims() {
  try {
    console.log('🚀 [Worker] Loading initial 1000 claims...');
    const response = await fetch(
      'http://localhost:8001/claims?_start=0&_limit=1000',
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch initial claims: ${response.status}`);
    }
    const claims = await response.json();
    console.log(`✅ [Worker] Loaded ${claims.length} initial claims`);
    return claims.map(formatClaim);
  } catch (error) {
    console.error('❌ [Worker] Error loading initial claims:', error);
    throw new Error(`Failed to load initial claims: ${error}`);
  }
}

// Load a specific chunk with cache busting
async function loadChunk(startIndex, limit) {
  try {
    console.log(
      `🔄 [Worker] Loading chunk ${startIndex}-${startIndex + limit - 1}...`
    );
    const response = await fetch(
      `http://localhost:8001/claims?_start=${startIndex}&_limit=${limit}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch chunk: ${response.status}`);
    }
    const claims = await response.json();
    console.log(
      `✅ [Worker] Loaded ${claims.length} claims for chunk ${startIndex}-${startIndex + limit - 1}`
    );
    return claims.map(formatClaim);
  } catch (error) {
    console.error(
      `❌ [Worker] Error loading chunk ${startIndex}-${startIndex + limit - 1}:`,
      error
    );
    throw new Error(`Failed to load chunk: ${error}`);
  }
}

// Load all claims for refresh with cache busting
async function loadAllClaims() {
  try {
    console.log('🔄 [Worker] Refreshing all claims...');
    const timestamp = Date.now(); // Add timestamp for cache busting
    const response = await fetch(
      `http://localhost:8001/claims?_start=0&_limit=1000000&_t=${timestamp}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to refresh claims: ${response.status}`);
    }
    const claims = await response.json();
    console.log(`✅ [Worker] Refreshed ${claims.length} total claims`);
    return claims.map(formatClaim);
  } catch (error) {
    console.error('❌ [Worker] Error refreshing claims:', error);
    throw new Error(`Failed to refresh claims: ${error}`);
  }
}

// Handle messages from main thread
self.onmessage = async (e) => {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case 'LOAD_INITIAL': {
        const initialClaims = await loadInitialClaims();
        self.postMessage({
          type: 'INITIAL_LOADED',
          data: initialClaims,
        });
        break;
      }

      case 'LOAD_CHUNK': {
        const { startIndex, limit } = payload;
        const chunk = await loadChunk(startIndex, limit);
        self.postMessage({
          type: 'CHUNK_LOADED',
          data: { claims: chunk, startIndex, limit },
        });
        break;
      }

      case 'REFRESH_ALL': {
        const allClaims = await loadAllClaims();
        self.postMessage({
          type: 'ALL_REFRESHED',
          data: allClaims,
        });
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
