import React from 'react';
import { X, ArrowUp, ArrowDown, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    preferences,
    toggleWidgetVisibility,
    moveWidgetOrder,
    resetDashboardWidgets,
  } = useLifeOS();

  if (!isOpen) return null;

  const sortedWidgets = [...preferences.dashboardWidgets].sort((a, b) => a.order - b.order);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customizer-modal-title"
    >
      <div className="w-full max-w-xl bg-[#FAF8F5] dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2
              id="customizer-modal-title"
              className="text-lg font-semibold text-stone-900 dark:text-stone-100"
            >
              Customize Home Overview
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Choose which daily modules appear on your Home canvas and adjust their sequence.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-2 flex-1">
          <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-[#121110]">
            {sortedWidgets.map((widget, idx) => (
              <div
                key={widget.id}
                className="p-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular text-xs text-stone-400 dark:text-stone-500">
                      0{idx + 1}.
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        widget.visible
                          ? 'text-stone-900 dark:text-stone-100'
                          : 'text-stone-400 dark:text-stone-500 line-through'
                      }`}
                    >
                      {widget.label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 pl-6">
                    {widget.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveWidgetOrder(widget.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 rounded-md transition-colors"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveWidgetOrder(widget.id, 'down')}
                    disabled={idx === sortedWidgets.length - 1}
                    className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 disabled:opacity-30 rounded-md transition-colors"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                      widget.visible
                        ? 'border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800/70'
                        : 'border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    {widget.visible ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Shown
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Hidden
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-100/60 dark:bg-[#151412]">
          <button
            type="button"
            onClick={resetDashboardWidgets}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Default Layout
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Save Layout
          </button>
        </div>
      </div>
    </div>
  );
};
