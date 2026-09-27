import { useState } from "react";

interface Options {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
}

/** Promise-based confirm modal, styled like the game (replaces window.confirm). */
export function useConfirm() {
  const [state, setState] = useState<(Options & { resolve: (v: boolean) => void }) | null>(null);

  function confirm(opts: Options): Promise<boolean> {
    return new Promise((resolve) => setState({ ...opts, resolve }));
  }

  function close(result: boolean) {
    state?.resolve(result);
    setState(null);
  }

  const node = state ? (
    <div className="modal-bg" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal">
        <h2 id="confirm-title">{state.title}</h2>
        <p className="muted">{state.body}</p>
        <div className="confirm-actions">
          <button type="button" className="ghost" onClick={() => close(false)}>Vazgeç</button>
          <button type="button" className={state.danger ? "primary" : "devir-btn"} onClick={() => close(true)}>
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, node };
}
