import { useState, useEffect } from "react";
import {
 Button,
 Heading,
 Flex,
 View,
 Grid,
 Divider,
} from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/
resource').Schema>}
 */
Amplify.configure(outputs);
const client = generateClient({
 authMode: "userPool",
});
export default function App() {
 const [userprofiles, setUserProfiles] = useState([]);
 const [trailSteps, setTrailSteps] = useState([]);
 const [newStep, setNewStep] = useState({ stepName: '', analyze: '', result: '' });
 const [editingStepId, setEditingStepId] = useState(null);
 const [editingValues, setEditingValues] = useState({ stepName: '', analyze: '', result: '' });
 
 const { user, signOut } = useAuthenticator((context) => [context.user]);
 
 async function fetchUserProfile() {
  try {
    const { data: profiles } = await client.models.UserProfile.list();
    setUserProfiles(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
  }
 }
 
 async function fetchTrailSteps() {
  try {
    const { data: steps } = await client.models.TrailSteps.list();
    setTrailSteps(steps);
  } catch (error) {
    console.error("Error fetching trail steps:", error);
  }
 }
 
 async function createTrailStep(e) {
  e.preventDefault();
  try {
    const { data: created } = await client.models.TrailSteps.create({
        stepName: newStep.stepName,
        analyze: newStep.analyze,
        result: newStep.result,
    });
    setTrailSteps((prev) => [...prev, created]);
    setNewStep({ stepName: '', analyze: '', result: '' });
  } catch (error) {
    console.error('Error creating trail step:', error);
  }
 }
 
 async function deleteTrailStep(id) {
  try {
    await client.models.TrailSteps.delete({ id });
    setTrailSteps((prev) => prev.filter((s) => s.id !== id));
  } catch (error) {
    console.error('Error deleting trail step:', error);
  }
 }
 
 async function updateTrailStep(id, updates) {
  try {
    const { data: updated } = await client.models.TrailSteps.update({
      id,
      ...updates,
    });
    setTrailSteps((prev) => prev.map((s) => (s.id === id ? updated : s)));
  } catch (error) {
    console.error('Error updating trail step:', error);
  }
 }
 
 useEffect(() => {
   if (user) {
     fetchUserProfile();
     fetchTrailSteps();
   }
 }, [user]);
 
 return (
  <Flex
    className="App"
    justifyContent="center"
    alignItems="center"
    direction="column"
    width="70%"
    margin="0 auto"
  >
    <Heading level={1}>My Profile</Heading>
    <Divider />
    <Grid
      margin="3rem 0"
      autoFlow="column"
      justifyContent="center"
      gap="2rem"
      alignContent="center"
    >
      <div>{userprofiles}</div>
    {userprofiles.map((userprofile) => (
      <Flex
        key={userprofile.id || userprofile.email}
        direction="column"
        justifyContent="center"
        alignItems="center"
        gap="2rem"
        border="1px solid #ccc"
        padding="2rem"
        borderRadius="5%"
        className="box"
      >
      <View>
        <Heading level="3">{userprofile.email}</Heading>
     </View>
    </Flex>
    ))}
 </Grid>
 
    <Heading level={1}>My Trails</Heading>
    <Divider />
    <form onSubmit={createTrailStep} style={{ margin: '1rem 0', width: '100%' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Step Name"
          value={newStep.stepName}
          onChange={(e) => setNewStep((s) => ({ ...s, stepName: e.target.value }))}
          style={{ flex: '1', padding: '0.5rem' }}
          required
        />
        <input
          type="text"
          placeholder="Analyze"
          value={newStep.analyze}
          onChange={(e) => setNewStep((s) => ({ ...s, analyze: e.target.value }))}
          style={{ flex: '1', padding: '0.5rem' }}
          required
        />
        <input
          type="text"
          placeholder="Result"
          value={newStep.result}
          onChange={(e) => setNewStep((s) => ({ ...s, result: e.target.value }))}
          style={{ flex: '1', padding: '0.5rem' }}
          required
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Add Step</button>
      </div>
    </form>
    {trailSteps.length > 0 ? (
      <table style={{ width: '100%', margin: '1rem 0', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Step Name</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Analyze</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Result</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trailSteps.map((step) => (
            <tr key={step.id || step.stepName}>
              {editingStepId === step.id ? (
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
                  <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}><div dangerouslySetInnerHTML={{ __html: step.result }} /></td>
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
          ))}
        </tbody>
      </table>
    ) : (
      <p>No trail steps found.</p>
    )}
    <Button onClick={signOut}>Sign Out</Button>
 </Flex>
 );
}