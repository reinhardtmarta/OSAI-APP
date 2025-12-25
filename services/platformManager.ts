
import { PlatformType, PlatformCapabilities } from '../types';

class PlatformManager {
  private static instance: PlatformManager;
  private currentPlatform: PlatformType;

  private constructor() {
    this.currentPlatform = this.detectPlatform();
  }

  public static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
    }
    return PlatformManager.instance;
  }

  private detectPlatform(): PlatformType {
    const userAgent = navigator.userAgent || navigator.vendor;
    
    if (/android/i.test(userAgent)) {
      return PlatformType.ANDROID;
    }
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return PlatformType.IOS;
    }
    
    return PlatformType.WEB;
  }

  public getPlatform(): PlatformType {
    return this.currentPlatform;
  }

  public getCapabilities(): PlatformCapabilities {
    const isAndroid = this.currentPlatform === PlatformType.ANDROID;
    const isIos = this.currentPlatform === PlatformType.IOS;

    return {
      // Android allows true system overlays; iOS restricts overlays to the current app/context.
      hasSystemOverlay: isAndroid,
      
      // Android allows background audio with accessibility services; 
      // iOS browsers stop audio capture when app is backgrounded.
      hasBackgroundListening: isAndroid, 
      
      hasHapticFeedback: isAndroid || isIos,
      
      // Hardware integration like calling, app management is more open on Android.
      hasHardwareIntegration: isAndroid
    };
  }

  public triggerHaptic() {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  }
}

export const platformManager = PlatformManager.getInstance();
