import * as Popover from "@radix-ui/react-popover";
import { RefreshCw } from "lucide-react";

type Props = {
  name: string;
  email: string;
  picture: string;
  onLogout: () => void;
};

export function CalendarUserMenu({ name, email, picture, onLogout }: Props) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
          <img
            src={picture}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          className="z-50 w-64 rounded-xl shadow-xl border border-gray-200 bg-white p-4 text-sm"
        >
          <div className="flex items-center gap-3">
            <img
              src={picture}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover border"
            />
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-gray-500 text-xs">{email}</p>
            </div>
          </div>

          <hr className="my-3" />

          <div className="flex gap-2 items-center cursor-pointer hover:bg-gray-100 py-1 px-2 hover:rounded-lg" onClick={onLogout}>
            <RefreshCw className="size-4 text-gray-700" />
            <p className="text-sm font-medium text-gray-700">Cambiar de calendario</p>
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
