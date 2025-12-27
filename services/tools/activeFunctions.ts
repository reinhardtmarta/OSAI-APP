
import { FunctionDeclaration, Type } from '@google/genai';

export const openApp: FunctionDeclaration = {
  name: 'openApp',
  parameters: {
    type: Type.OBJECT,
    description: 'Opens a specific application on the device.',
    properties: {
      appName: { type: Type.STRING, description: 'Application name (e.g., Gmail, WhatsApp, Settings).' },
      actionAfterOpen: { type: Type.STRING, description: 'Optional: What to do right after opening the app.' }
    },
    required: ['appName'],
  },
};

export const typeContent: FunctionDeclaration = {
  name: 'typeContent',
  parameters: {
    type: Type.OBJECT,
    description: 'Types text content into the currently focused field in the active application.',
    properties: {
      text: { type: Type.STRING, description: 'The exact text to be typed.' },
      targetApp: { type: Type.STRING, description: 'The name of the application where text will be inserted.' }
    },
    required: ['text'],
  },
};

export const clickElement: FunctionDeclaration = {
  name: 'clickElement',
  parameters: {
    type: Type.OBJECT,
    description: 'Clicks a specific UI element or at a set of coordinates.',
    properties: {
      elementId: { type: Type.STRING, description: 'ID or name of the button/element.' },
      coordinates: { 
        type: Type.OBJECT, 
        properties: {
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER }
        }
      }
    },
    required: ['elementId'],
  },
};

export const readSocialMediaSummary: FunctionDeclaration = {
  name: 'readSocialMediaSummary',
  parameters: {
    type: Type.OBJECT,
    description: 'Accesses and summarizes relevant news and posts from social media platforms.',
    properties: {
      platform: { type: Type.STRING, description: 'Platform (X, Instagram, LinkedIn, etc).' },
    },
    required: ['platform'],
  },
};

export const interactWithApp: FunctionDeclaration = {
  name: 'interactWithApp',
  parameters: {
    type: Type.OBJECT,
    description: 'Interacts with apps for complex tasks.',
    properties: {
      appName: { type: Type.STRING },
      taskDescription: { type: Type.STRING }
    },
    required: ['appName', 'taskDescription'],
  },
};

export const activeTools = [
  openApp,
  typeContent,
  clickElement,
  readSocialMediaSummary,
  interactWithApp
];
