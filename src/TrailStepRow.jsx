import React from 'react';
import QRCode from "react-qr-code";

export default function TrailStepRow({
  step,
  currentProfile,
  editingStepId,
  editingValues,
  setEditingStepId,
  setEditingValues,
  updateTrailStep,
  deleteTrailStep,
  analyzeStep,
  showActions,
}) {
  const isRevealed = currentProfile?.revealedSteps?.includes(step.id) || false;

  const isAnalyzed = currentProfile?.analyzedSteps?.includes(step.id) || false;

  if (!isRevealed && !currentProfile?.gm) {
    return (
      <></>
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
            {showActions && (
              <>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center' }}>
                    <>
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
                    </>
                </td>
                  <td style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center' }}>
                    <>
                      <div>Quest! {window.location.origin + '/?stepName=' + step.stepName}</div>
                      <QRCode
                        value={window.location.origin + '/?stepName=' + step.stepName} // The data you want to encode in the QR code
                        size={256} // Optional: control the size of the QR code
                      />
                    </>
                </td>
            </>
            )}
        </>
      )}
    </tr>
  );
}
