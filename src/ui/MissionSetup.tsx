import { useState } from 'react';
import {
  AVAILABLE_MISSION_PROFILES,
  createDefaultMissionConfiguration,
  findMissionProfile,
  isValidMissionConfiguration,
  type MissionConfiguration,
} from '../simulation/missions/mission-configuration';
import {
  AVAILABLE_ROCKET_MODELS,
  findRocketModel,
} from '../simulation/spacecraft/rocket-models';

function formatTonnes(kilograms: number): string {
  return `${(kilograms / 1000).toFixed(1)} t`;
}

function formatKilonewtons(newtons: number): string {
  return `${(newtons / 1000).toFixed(0)} kN`;
}

interface MissionSetupProps {
  onBack: () => void;
  onLaunch: (configuration: MissionConfiguration) => void;
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
          <span>Mission profile</span>
          <select
            value={configuration.missionProfileId}
            onChange={(event) => updateField('missionProfileId', event.target.value)}
          >
            {AVAILABLE_MISSION_PROFILES.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name} — {profile.destinationName} (
                {profile.difficulty})
              </option>
            ))}
          </select>
        </label>
        <p className="mission-setup__field-hint">
          {findMissionProfile(configuration.missionProfileId)?.description}
        </p>
        <div className="mission-setup__field">
          <span>Rocket model</span>
          <div className="mission-setup__rocket-list">
            {AVAILABLE_ROCKET_MODELS.map((model) => {
              const selected = model.id === configuration.rocketModelId;
              return (
                <div
                  key={model.id}
                  className={
                    selected
                      ? 'mission-setup__rocket-card mission-setup__rocket-card--selected'
                      : 'mission-setup__rocket-card'
                  }
                >
                  <p className="mission-setup__rocket-card-name">{model.name}</p>
                  <dl className="mission-setup__rocket-card-specs">
                    <dt>Mass</dt>
                    <dd>{formatTonnes(model.dryMass + model.fuelMass)}</dd>
                    <dt>Fuel</dt>
                    <dd>{model.fuelMass} kg</dd>
                    <dt>Thrust</dt>
                    <dd>{formatKilonewtons(model.engineThrust)}</dd>
                  </dl>
                  <p className="mission-setup__rocket-card-description">
                    {model.description}
                  </p>
                  <button
                    type="button"
                    aria-label={`Select ${model.name}`}
                    aria-pressed={selected}
                    onClick={() => updateField('rocketModelId', model.id)}
                  >
                    {selected ? 'Selected' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
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
  onLaunch: (configuration: MissionConfiguration) => void;
}

function MissionSummary({ configuration, onEdit, onLaunch }: MissionSummaryProps) {
  const profile = findMissionProfile(configuration.missionProfileId);
  const rocketModel = findRocketModel(configuration.rocketModelId);

  return (
    <div className="mission-setup">
      <h1 className="mission-setup__title">Mission setup</h1>
      <dl className="mission-setup__summary">
        <dt>Mission</dt>
        <dd>{configuration.missionName}</dd>
        <dt>Spacecraft</dt>
        <dd>{configuration.spacecraftName}</dd>
        <dt>Rocket model</dt>
        <dd>{rocketModel?.name}</dd>
        <dt>Destination</dt>
        <dd>{profile?.destinationName}</dd>
        <dt>Objective</dt>
        <dd>{profile?.objectiveDescription}</dd>
      </dl>
      <div className="mission-setup__actions">
        <button type="button" onClick={onEdit}>
          Edit
        </button>
        <button type="button" onClick={() => onLaunch(configuration)}>
          Launch mission
        </button>
      </div>
    </div>
  );
}
