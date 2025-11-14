interface KvItemProps {
  key_name: string;
  value: string;
  index: number;
  updateValue: (key_name: string, newValue: string) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
}

const KvItem: React.FC<KvItemProps> = ({ key_name, value, index, updateValue, handleKeyDown }) => {
  return (
    <div className="flex flex-row items-center w-[98%] rounded-md bg-zinc-600 mb-1">
      <span className="w-1/2 pl-2 text-nowrap">{key_name}</span>
      <input
        type="text"
        name={`${key_name}-${index}`}
        value={value}
        onChange={(e) => updateValue(key_name, e.target.value)}
        onKeyDown={(e) => handleKeyDown?.(e, index)}
        className="bg-zinc-700 rounded-r-sm px-2 outline-none w-full"
      />
    </div>
  );
};

export default KvItem;