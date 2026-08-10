import { useState } from 'react';
import {
  AVAILABLE_DESTINATIONS,
  AVAILABLE_OBJECTIVES,
  createDefaultMissionConfiguration,
  findDestination,
  findObjective,
  isValidMissionConfiguration,
  type MissionConfiguration,
} from '../simulation/missions/mission-configuration';

interface MissionSetupProps {
  onBack: () => void;
  onLaunch: () => void;
}

export function MissionSetup({ onBack, onLaunch }: MissionSetupProps) {
  const [configuration, setConfiguration] = useState<MissionConfiguration>(
    createDefaultMissionConfiguration,
  );
  const [reviewing, setReviewing] = useState(false);

  function updateField<K extends keyof MissionConfiguration>(
    field: K,
    value: MissionConfiguration[K],
  ) {
    setConfiguration((current) => ({ ...current, [field]: value }));
  }

  if (reviewing) {
    return (
      <MissionSummary
        configuration={configuration}
        onEdit={() => setReviewing(false)}
        onLaunch={onLaunch}
      />
    );
  }

  return (
    <div className="mission-setup">
      <h1 className="mission-setup__title">Mission setup</h1>
      <form
        className="mission-setup__form"
        onSubmit={(event) => {
          event.preventDefault();
          setReviewing(true);
        }}
      >
        <label className="mission-setup__field">
          <span>Mission name</span>
          <input
            type="text"
            value={configuration.missionName}
            onChange={(event) => updateField('missionName', event.target.value)}
          />
        </label>
        <label className="mission-setup__field">
          <span>Spacecraft name</span>
          <input
            type="text"
            value={configuration.spacecraftName}
            onChange={(event) => updateField('spacecraftName', event.target.value)}
          />
        </label>
        <label className="mission-setup__field">
          <span>Destination</span>
          <select
            value={configuration.destinationId}
            onChange={(event) => updateField('destinationId', event.target.value)}
          >
            {AVAILABLE_DESTINATIONS.map((destination) => (
              <option key={destination.id} value={destination.id}>
                {destination.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mission-setup__field">
          <span>Objective</span>
          <select
            value={configuration.objectiveId}
            onChange={(event) => updateField('objectiveId', event.target.value)}
          >
            {AVAILABLE_OBJECTIVES.map((objective) => (
              <option key={objective.id} value={objective.id}>
                {objective.description}
              </option>
            ))}
          </select>
        </label>
        <div className="mission-setup__actions">
          <button type="button" onClick={onBack}>
            Back
          </button>
          <button type="submit" disabled={!isValidMissionConfiguration(configuration)}>
            Review mission
          </button>
        </div>
      </form>
    </div>
  );
}

interface MissionSummaryProps {
  configuration: MissionConfiguration;
  onEdit: () => void;
  onLaunch: () => void;
}

function MissionSummary({ configuration, onEdit, onLaunch }: MissionSummaryProps) {
  const destination = findDestination(configuration.destinationId);
  const objective = findObjective(configuration.objectiveId);

  return (
    <div className="mission-setup">
      <h1 className="mission-setup__title">Mission setup</h1>
      <dl className="mission-setup__summary">
        <dt>Mission</dt>
        <dd>{configuration.missionName}</dd>
        <dt>Spacecraft</dt>
        <dd>{configuration.spacecraftName}</dd>
        <dt>Destination</dt>
        <dd>{destination?.name}</dd>
        <dt>Objective</dt>
        <dd>{objective?.description}</dd>
      </dl>
      <div className="mission-setup__actions">
        <button type="button" onClick={onEdit}>
          Edit
        </button>
        <button type="button" onClick={onLaunch}>
          Launch mission
        </button>
      </div>
    </div>
  );
}
