/**
 * WarningChain.js - the shared words of the L06 warning lesson.
 *
 * Plain data only: the four stages of the chain and the instrument that does each stage's job
 * (WarningChainScene), the five levels the alert drops through and the four channels that carry
 * it (AlertCascadeScene). The two scenes and the arcade drill all read the same names from here,
 * so the slide, the cascade and the drill never drift apart.
 *
 * The stub names the level list "Indian Tsunami Early Warning Centre (ITEWC)"; the arcade deck
 * (simulations/L01/OceansDeck.js, not this file) shortens it to "ITEWC (warning centre)" because a
 * train carriage is too narrow for the long name. The full name is kept here.
 */

/** The four stages of the chain, in the order the work is done [WarningChainScene stub]. */
export const WARNING_STAGES = [
  { id: 'detection', name: 'Detection', instrument: 'Seismic stations', tone: 1, icon: 'globe' },
  { id: 'confirmation', name: 'Confirmation', instrument: 'Ocean Bottom Pressure Recorders', tone: 2, icon: 'eye' },
  { id: 'tracking', name: 'Tracking', instrument: 'Coastal tide gauges and radars', tone: 3, icon: 'route' },
  { id: 'alert', name: 'Warning dissemination', instrument: 'Satellite and SMS', tone: 4, icon: 'phone' },
];

/** The five levels the alert drops through, top to bottom [AlertCascadeScene stub]. */
export const CASCADE_LEVELS = [
  { id: 'itewc', name: 'Indian Tsunami Early Warning Centre (ITEWC)', channels: ['satellite'] },
  { id: 'goi', name: 'Government of India', channels: ['sms', 'email'] },
  { id: 'state', name: 'State governments', channels: ['sms', 'email'] },
  { id: 'teams', name: 'Emergency response teams', channels: ['sms', 'email'] },
  { id: 'public', name: 'The public on the coast', channels: ['sms', 'board'] },
];

/** The four channels the chapter names, in the slide's order [AlertCascadeScene stub]. */
export const WARNING_CHANNELS = [
  { id: 'satellite', name: 'Satellite-based communication networks' },
  { id: 'sms', name: 'SMS' },
  { id: 'email', name: 'Email' },
  { id: 'board', name: 'Coastal display boards' },
];

/** The channel ids a level is reached by - CASCADE_LEVELS[i].channels, kept in the slide's order. */
export const channelIdsFor = (level) => level.channels;
