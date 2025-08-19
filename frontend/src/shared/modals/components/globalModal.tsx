import { useAppDispatch, useAppSelector } from "@shared/store";
import { closeModal } from "../redux";
import { modalRegistry } from "../service/registry";
import { resolveModalPromise } from "../service/service";

export default function GlobalModal() {
  const stack = useAppSelector((s => s.modal.stack));
  const dispatch = useAppDispatch();

  if (!stack.length) return null;

  return (
    <>
      {stack.map((entry) => {
        const Component = modalRegistry[entry.key];
        if (!Component) return null;

        const handleResolve = (result?: any) => {
          dispatch(closeModal({ id: entry.id }));
          resolveModalPromise(entry.id, { id: entry.id, ok: true, result });
        };

        const handleCancel = () => {
          dispatch(closeModal({ id: entry.id }));
          resolveModalPromise(entry.id, { id: entry.id, ok: false });
        };

        return (
          <Component
            key={entry.id}
            id={entry.id}

            {...entry.props}

            onResolve={handleResolve}
            onCancel={handleCancel}
          />
        );
      })}
    </>
  );
};
