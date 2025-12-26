import { useSearchParams, useNavigate } from 'react-router-dom';

export function useUrlStringState(key: string, defaultValue: string = '') {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const value = searchParams.get(key) || defaultValue;

  const updateValue = (newValue: string | ((prev: string) => string)) => {
    const actualValue = typeof newValue === 'function' ? newValue(value) : newValue;

    const params = new URLSearchParams(searchParams.toString());

    if (actualValue === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, actualValue);
    }

    navigate(`?${params.toString()}`, { replace: true });
  };

  return [value, updateValue] as const;
}

export function useUrlArrayState(key: string, defaultValue: string[] = []) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const value = (() => {
    const paramValues = searchParams.getAll(key);
    if (paramValues.length > 0) {
      return paramValues.filter((v: string) => v !== '');
    }

    const paramValue = searchParams.get(key);
    if (paramValue && paramValue !== '') {
      const separators = [';', '|', ','];
      for (const sep of separators) {
        if (paramValue.includes(sep)) {
          return paramValue.split(sep).map((s: string) => s.trim()).filter((s: string) => s !== '');
        }
      }
      return [paramValue];
    }

    return defaultValue;
  })();

  const updateValue = (newValue: string[] | ((prev: string[]) => string[])) => {
    const actualValue = typeof newValue === 'function' ? newValue(value) : newValue;

    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);

    actualValue.forEach((val) => {
      if (val && val.trim() !== '') {
        params.append(key, val.trim());
      }
    });

    navigate(`?${params.toString()}`, { replace: true });
  };

  return [value, updateValue] as const;
}

export function useUrlSortState(key: string, defaultValue: string) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const value = searchParams.get(key) || defaultValue;

  const updateValue = (newValue: string | ((prev: string) => string)) => {
    const actualValue = typeof newValue === 'function' ? newValue(value) : newValue;

    const params = new URLSearchParams(searchParams.toString());

    if (actualValue === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, actualValue);
    }

    navigate(`?${params.toString()}`, { replace: true });
  };

  return [value, updateValue] as const;
}
