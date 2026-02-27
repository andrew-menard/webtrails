import React from 'react';

export default function TrailStepRow({
  step,
  currentProfile,
  editingStepId,
  editingValues,
  setEditingStepId,
  setEditingValues,
  updateTrailStep,
  deleteTrailStep,
  revealStep,
  analyzeStep
}) {
  const isRevealed = currentProfile?.revealedSteps?.includes(step.id) || false;

  const isAnalyzed = currentProfile?.analyzedSteps?.includes(step.id) || false;

  if (!isRevealed) {
    return (
      <tr key={step.id || step.stepName}>
        <td colSpan="4" style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center' }}>
          <button onClick={() => revealStep(step.id)} style={{ padding: '0.5rem 1rem' }}>
            Reveal Step
          </button>
        </td>
      </tr>
    );
  }

  const inEdit = editingStepId === step.id;

  return (
    <tr key={step.id || step.stepName}>
      {inEdit ? (
        <>
          <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
            <input
              type="text"
              value={editingValues.stepName}
              onChange={(e) => setEditingValues((v) => ({ ...v, stepName: e.target.value }))}
            />
          </td>
          <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
            <input
              type="text"
              value={editingValues.analyze}
              onChange={(e) => setEditingValues((v) => ({ ...v, analyze: e.target.value }))}
            />
          </td>
          <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
            <input
              type="text"
              value={editingValues.result}
              onChange={(e) => setEditingValues((v) => ({ ...v, result: e.target.value }))}
            />
          </td>
          <td style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center' }}>
            <button
              onClick={() => {
                updateTrailStep(step.id, editingValues);
                setEditingStepId(null);
              }}
              style={{ padding: '0.25rem 0.5rem', marginRight: '0.25rem' }}
            >
              Save
            </button>
            <button
              onClick={() => setEditingStepId(null)}
              style={{ padding: '0.25rem 0.5rem' }}
            >
              Cancel
            </button>
          </td>
        </>
      ) : (
        <>
          <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{step.stepName}</td>
          <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{step.analyze}</td>
          <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
            { isAnalyzed ? (
              <div dangerouslySetInnerHTML={{ __html: step.result }} /> 
            ) : (
              <button onClick={() => analyzeStep(step.id)} style={{ padding: '0.5rem 1rem' }}>
                Analyze Step
              </button>
            )}
          </td>
          <td style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center' }}>
            <button
              onClick={() => {
                setEditingStepId(step.id);
                setEditingValues({ stepName: step.stepName, analyze: step.analyze, result: step.result });
              }}
              style={{ padding: '0.25rem 0.5rem', marginRight: '0.25rem' }}
            >
              Edit
            </button>
            <button onClick={() => deleteTrailStep(step.id)} style={{ padding: '0.25rem 0.5rem' }}>
              Delete
            </button>
          </td>
        </>
      )}
    </tr>
  );
}
