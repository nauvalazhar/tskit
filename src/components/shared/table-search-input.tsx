import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/selia/input';
import { InputGroup, InputGroupAddon } from '@/components/selia/input-group';

export function TableSearchInput({
  placeholder,
  value,
  onSearch,
  onClear,
  extraFilters,
}: {
  placeholder: string;
  value: string;
  onSearch: (value: string | undefined) => void;
  onClear: () => void;
  extraFilters?: React.ReactNode;
}) {
  const input = (
    <InputGroup className="w-full sm:w-xs">
      <InputGroupAddon align="start">
        <SearchIcon />
      </InputGroupAddon>
      <Input
        key={value}
        placeholder={placeholder}
        defaultValue={value}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const v = (e.target as HTMLInputElement).value;
            onSearch(v || undefined);
          }
        }}
      />
    </InputGroup>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {extraFilters ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {input}
          {extraFilters}
        </div>
      ) : (
        input
      )}
      {value && (
        <p className="text-sm text-muted">
          Showing results for "<strong>{value}</strong>".{' '}
          <button className="underline cursor-pointer" onClick={onClear}>
            Clear search
          </button>
        </p>
      )}
    </div>
  );
}
