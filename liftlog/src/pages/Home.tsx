import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { templateService } from '@/services/templates/templateService';
import { templateDraftStorage } from '@/utils/templateDraftStorage';
import type { Template } from '@/types/workout';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect back to template creation if there's an unsaved draft
  useEffect(() => {
    const draft = templateDraftStorage.loadDraft();
    if (draft && (draft.name.trim() !== '' || draft.exercises.length > 0)) {
      navigate('/templates/new', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    setLoading(true);
    templateService
      .getTemplates(user.uid)
      .then((data) => {
        if (!cancelled) {
          setTemplates(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load templates:', err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleStartEmpty() {
    navigate('/workout');
  }

  function handleStartFromTemplate(template: Template) {
    navigate('/workout', {
      state: {
        templateId: template.id,
        templateName: template.name,
        exercises: template.exercises,
      },
    });
  }

  async function handleDeleteTemplate(templateId: string) {
    if (!user || !templateId) return;
    setDeletingId(templateId);
    try {
      await templateService.deleteTemplate(user.uid, templateId);
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (err) {
      console.error('Failed to delete template:', err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 text-on-background">
      {/* Header */}
      <div className="mb-6 px-6">
        <h1 className="text-2xl font-bold text-on-surface">LiftLog</h1>
        {user && <p className="mt-1 text-sm text-zinc-500">{user.email}</p>}
      </div>

      {/* Start Empty Workout */}
      <div className="mb-8 px-6">
        <button
          type="button"
          onClick={handleStartEmpty}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-on-primary active:opacity-80 transition-opacity"
        >
          {/* Dumbbell / plus icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Start Empty Workout
        </button>
      </div>

      {/* Templates */}
      <div className="px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">My Templates</h2>
          <button
            type="button"
            onClick={() => navigate('/templates/new')}
            className="flex min-h-[44px] items-center gap-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-primary active:opacity-80 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl bg-surface p-6 text-center">
            <p className="text-zinc-400">No templates yet.</p>
            <p className="mt-1 text-sm text-zinc-500">
              Tap "+ New" above to create a template, or save one after a workout.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {templates.map((template) => (
              <div key={template.id} className="rounded-xl bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-on-surface">
                    {template.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      template.id && void handleDeleteTemplate(template.id)
                    }
                    disabled={deletingId === template.id}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-500 active:text-error transition-colors disabled:opacity-50"
                    aria-label={`Delete ${template.name}`}
                  >
                    {/* Trash icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>

                <p className="mb-3 text-sm text-zinc-400">
                  {template.exercises.length} exercise
                  {template.exercises.length !== 1 ? 's' : ''}
                  {' · '}
                  {template.exercises.reduce((sum, ex) => sum + ex.sets, 0)} sets
                </p>

                <div className="mb-3 flex flex-wrap gap-1">
                  {template.exercises.slice(0, 4).map((ex) => (
                    <span
                      key={ex.exerciseId}
                      className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400"
                    >
                      {ex.exerciseName}
                    </span>
                  ))}
                  {template.exercises.length > 4 && (
                    <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                      +{template.exercises.length - 4} more
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleStartFromTemplate(template)}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary active:opacity-80 transition-opacity"
                >
                  Start Workout
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
