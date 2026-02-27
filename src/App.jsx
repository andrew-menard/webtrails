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
import TrailStepRow from './TrailStepRow';
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
    console.log('Current user:', {
      userId: user?.userId,
      loginId: user?.signInDetails?.loginId,
      username: user?.username,
      sub: user?.userId, // might be different from loginId
    });

    const { data: profiles } = await client.models.UserProfile.list();
    console.log('All accessible profiles:', profiles);
    if (profiles.length === 0) {
      console.warn('No profiles returned by list(). This usually means the authorization filter removed them.');
      console.log('Expected profileOwner format:', `${user?.userId}::${user?.signInDetails?.loginId}`);
    }
    
    setUserProfiles(profiles);
    
    // Check if current user has a profile, and create one if not
    if (user && user.userId) {
      // try to find profile by profileOwner or email (email is loginId)
    const userEmail = user.signInDetails?.loginId || user.username || '';
    const userProfile = profiles.find(
      (p) =>
        p.profileOwner?.startsWith(user.userId) ||
        (userEmail && p.email === userEmail)
    );
      
      if (!userProfile) {
        try {
          const userEmail = user.signInDetails?.loginId || user.username || 'unknown';
          const profileOwner = `${user.userId}::${user.signInDetails?.loginId}`;
          
          // Refetch to ensure we have the latest state (avoids double-creation with Lambda)
          const { data: latestProfiles } = await client.models.UserProfile.list();
          const alreadyExists = latestProfiles.find(
            (p) =>
              p.profileOwner?.startsWith(user.userId) ||
              (userEmail && p.email === userEmail)
          );
          
          if (!alreadyExists) {
            const { data: newProfile } = await client.models.UserProfile.create({
              email: userEmail,
              profileOwner,
              revealedSteps: [],
              analyzedSteps: [],
              gm: false, // default to non-GM
            });
            
            setUserProfiles((prev) => [...prev, newProfile]);
            console.log('Created new profile for user:', userEmail);
          } else {
            // Profile was created by Lambda or in previous iteration; just update state
            setUserProfiles(latestProfiles);
          }
        } catch (createError) {
          console.error('Error creating user profile:', createError);
        }
      }
    }
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
 
 async function revealStep(stepId) {
  try {
    console.log('Revealing step:', stepId);
    
    const userEmail = user.signInDetails?.loginId || user.username || '';
    const currentProfile = userprofiles.find(
      (p) =>
        p.profileOwner?.startsWith(user.userId) ||
        (userEmail && p.email === userEmail)
    );
    
    if (!currentProfile) {
      console.error('Current user profile not found when revealing step');
      return;
    }
    
    const revealedSteps = [...(currentProfile.revealedSteps || [])];
    if (!revealedSteps.includes(stepId)) {
      revealedSteps.push(stepId);
    }
    console.log('Revealed steps to update:', revealedSteps);
    const { data: updated } = await client.models.UserProfile.update({
      id: currentProfile.id,
      revealedSteps,
    });
    
    console.log('Updated profile after revealing step:', updated);
    setUserProfiles((prev) => prev.map((p) => (p.id === currentProfile.id ? updated : p)));
  } catch (error) {
    console.error('Error revealing step:', error);
  }
 }

 async function analyzeStep(stepId) {
  try {
    console.log('Analyzing step:', stepId);
    
    const userEmail = user.signInDetails?.loginId || user.username || '';
    const currentProfile = userprofiles.find(
      (p) =>
        p.profileOwner?.startsWith(user.userId) ||
        (userEmail && p.email === userEmail)
    );
    
    if (!currentProfile) {
      console.error('Current user profile not found when analyzing step');
      return;
    }
    
    const analyzedSteps = [...(currentProfile.analyzedSteps || [])];
    if (!analyzedSteps.includes(stepId)) {
      analyzedSteps.push(stepId);
    }
    console.log('Analyzed steps to update:', analyzedSteps);
    const { data: updated } = await client.models.UserProfile.update({
      id: currentProfile.id,
      analyzedSteps,
    });
    
    console.log('Updated profile after analyzing step:', updated);
    setUserProfiles((prev) => prev.map((p) => (p.id === currentProfile.id ? updated : p)));
  } catch (error) {
    console.error('Error analyzing step:', error);
  }
 }
 useEffect(() => {
   if (user) {
     fetchUserProfile();
     fetchTrailSteps();
   }
 }, [user]);
 
 // deeplink support: reveal step if ?stepName=... present in URL
 useEffect(() => {
   const params = new URLSearchParams(window.location.search);
   const targetName = params.get('stepName');
   if (targetName && trailSteps.length > 0) {
     const matching = trailSteps.find((s) => s.stepName === targetName);
     if (matching) {
       revealStep(matching.id);
     }
   }
 }, [trailSteps]);
 
const userEmail = user.signInDetails?.loginId || user.username || '';
const currentProfile = userprofiles.find(
  (p) =>
    p.profileOwner?.startsWith(user.userId) ||
    (userEmail && p.email === userEmail)
);

const showActions = currentProfile?.gm || false;
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
      <View>
        <Heading level="3">{currentProfile?.email}</Heading>
     </View>
 </Grid>
 
    <Heading level={1}>My Trails</Heading>
    <Divider />
            {showActions && (
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
            )}
    {trailSteps.length > 0 ? (
      <table style={{ width: '100%', margin: '1rem 0', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Step Name</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Analyze</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Result</th>
            {showActions && (
              <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {trailSteps.map((step) => {
            const userEmail = user.signInDetails?.loginId || user.username || '';
            const currentProfile = userprofiles.find(
              (p) =>
                p.profileOwner?.startsWith(user.userId) ||
                (userEmail && p.email === userEmail)
            );

            return (
              <TrailStepRow
                key={step.id || step.stepName}
                step={step}
                currentProfile={currentProfile}
                editingStepId={editingStepId}
                editingValues={editingValues}
                setEditingStepId={setEditingStepId}
                setEditingValues={setEditingValues}
                updateTrailStep={updateTrailStep}
                deleteTrailStep={deleteTrailStep}
                revealStep={revealStep}
                analyzeStep={analyzeStep}
                showActions={showActions}
              />
            );
          })}
        </tbody>
      </table>
    ) : (
      <p>No trail steps found.</p>
    )}
    <Button onClick={signOut}>Sign Out</Button>
 </Flex>
 );
}