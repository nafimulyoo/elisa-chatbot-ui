import { useTheme } from "next-themes";

export const Header = ({ handleClear }: { handleClear: () => void }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between mb-6">
      <h1
        className="text-2xl sm:text-3xl font-semibold text-foreground flex items-center cursor-pointer text-gray-700"
        onClick={() => handleClear()}
      >
        Smart Analysis Q&A
      </h1>
    </div>
  );
};
