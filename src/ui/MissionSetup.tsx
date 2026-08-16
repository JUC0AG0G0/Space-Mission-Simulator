import { useEffect, useRef, useState } from 'react';
import {
  AVAILABLE_MISSION_PROFILES,
  createDefaultMissionConfiguration,
  findMissionProfile,
  isValidMissionConfiguration,
  MISSION_DIFFICULTY_LABELS,
  MISSION_NAME_MAX_LENGTH,
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
  const formHeadingRef = useRef<HTMLHeadingElement>(null);

  // Move keyboard focus to this screen's heading whenever it (re)appears —
  // on initial mount, and when coming back from the summary via "Edit" —
  // so a keyboard/screen reader user isn't left stranded on a button that
  // no longer exists in the previous screen's DOM.
  useEffect(() => {
    if (!reviewing) {
      formHeadingRef.current?.focus();
    }
  }, [reviewing]);

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
      <h1 className="mission-setup__title" ref={formHeadingRef} tabIndex={-1}>
        Mission setup
      </h1>
      <form
        className="mission-setup__form"
        onSubmit={(event) => {
          event.preventDefault();
          setConfiguration((current) => ({
            ...current,
            missionName: current.missionName.trim(),
            spacecraftName: current.spacecraftName.trim(),
          }));
          setReviewing(true);
        }}
      >
        <label className="mission-setup__field">
          <span>Mission name</span>
          <input
            type="text"
            maxLength={MISSION_NAME_MAX_LENGTH}
            value={configuration.missionName}
            onChange={(event) => updateField('missionName', event.target.value)}
          />
        </label>
        <label className="mission-setup__field">
          <span>Spacecraft name</span>
          <input
            type="text"
            maxLength={MISSION_NAME_MAX_LENGTH}
            value={configuration.spacecraftName}
            onChange={(event) => updateField('spacecraftName', event.target.value)}
          />
        </label>
        <label className="mission-setup__field">
          <span>Mission profile</span>
          <select
            value={configuration.missionProfileId}
            aria-describedby="mission-setup-profile-hint"
            onChange={(event) => updateField('missionProfileId', event.target.value)}
          >
            {AVAILABLE_MISSION_PROFILES.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name} — {profile.destinationName} (
                {MISSION_DIFFICULTY_LABELS[profile.difficulty]})
              </option>
            ))}
          </select>
        </label>
        <p id="mission-setup-profile-hint" className="mission-setup__field-hint">
          {findMissionProfile(configuration.missionProfileId)?.description}
        </p>
        <div className="mission-setup__field">
          <span>Rocket model</span>
          <div className="mission-setup__rocket-list">
            {AVAILABLE_ROCKET_MODELS.map((model) => {
              const selected = model.id === configuration.rocketModelId;
              const specsId = `mission-setup-rocket-specs-${model.id}`;
              const descriptionId = `mission-setup-rocket-description-${model.id}`;
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
                  <dl id={specsId} className="mission-setup__rocket-card-specs">
                    <dt>Mass</dt>
                    <dd>{formatTonnes(model.dryMass + model.fuelMass)}</dd>
                    <dt>Fuel</dt>
                    <dd>{model.fuelMass} kg</dd>
                    <dt>Thrust</dt>
                    <dd>{formatKilonewtons(model.engineThrust)}</dd>
                  </dl>
                  <p id={descriptionId} className="mission-setup__rocket-card-description">
                    {model.description}
                  </p>
                  <button
                    type="button"
                    aria-label={`Select ${model.name}`}
                    aria-describedby={`${specsId} ${descriptionId}`}
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
  const headingRef = useRef<HTMLHeadingElement>(null);

  // This component mounts fresh each time the player moves from the form to
  // the summary, so a mount-only effect is enough to move focus here too.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="mission-setup">
      <h1 className="mission-setup__title" ref={headingRef} tabIndex={-1}>
        Mission setup
      </h1>
      <dl className="mission-setup__summary">
        <dt>Mission</dt>
        <dd>{configuration.missionName}</dd>
        <dt>Spacecraft</dt>
        <dd>{configuration.spacecraftName}</dd>
        <dt>Rocket model</dt>
        <dd>{rocketModel?.name}</dd>
        <dt>Destination</dt>
        <dd>{profile?.destinationName}</dd>
        <dt>Difficulty</dt>
        <dd>{profile && MISSION_DIFFICULTY_LABELS[profile.difficulty]}</dd>
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
