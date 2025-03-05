interface SelectVersionProps {
  title: string;
  description: string;
  onClick: () => void;
  active: boolean;
}

export function SelectVersion({
  title,
  description,
  onClick,
  active,
}: SelectVersionProps) {
  return (
    <button
      className={`group flex flex-col gap-3 w-80 justify-center 
        items-center bg-gray-300 p-4 rounded-lg text-center
         ${
           active
             ? "bg-gray-600 text-white"
             : "hover:bg-gray-600 transition duration-200 hover:text-white"
         } `}
      onClick={onClick}
    >
      <h1 className="text-2xl font-bold">{title}</h1>
      <p>{description}</p>
      <button
        className={` bg-blue-500 px-5 py-3 rounded-xl font-medium 
        text-white  ${
          active
            ? "bg-green-500"
            : "transition duration-200 hover:bg-green-300 group-hover:bg-green-500"
        } `}
      >
        EJEMPLO
      </button>
    </button>
  );
}
