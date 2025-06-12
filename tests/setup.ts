// Test setup file
// Mock Web Audio API for tests
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 },
    type: 'sine'
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { 
      value: 0,
      linearRampToValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn()
    }
  }),
  destination: {},
  currentTime: 0,
  state: 'running',
  suspend: jest.fn(),
  resume: jest.fn()
}));

// Mock webkitAudioContext for Safari
(global as any).webkitAudioContext = global.AudioContext;