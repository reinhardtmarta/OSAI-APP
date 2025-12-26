
import { SupportedLanguage } from '../../types';

export class SpeechEngine {
  private recognition: any;
  private isMuted: boolean = true;
  private isActive: boolean = false;

  constructor(
    private lang: SupportedLanguage,
    private onResult: (final: string, interim: string) => void,
    private onError: (err: string) => void,
    private onEnd: () => void
  ) {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = lang;

    this.recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';

      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      this.onResult(final, interim);
    };

    this.recognition.onerror = (e: any) => {
      console.warn("Speech recognition error:", e.error);
      this.isActive = false;
      this.onError(e.error);
    };

    this.recognition.onend = () => {
      this.isActive = false;
      if (!this.isMuted) {
        setTimeout(() => this.start(), 100); // Tentar reconectar se não estiver silenciado
      }
      this.onEnd();
    };
  }

  public start() {
    if (!this.recognition || this.isActive) return;
    this.isMuted = false;
    try {
      this.recognition.start();
      this.isActive = true;
    } catch (e) {
      console.debug("Speech recognition already started or failed:", e);
    }
  }

  public stop() {
    this.isMuted = true;
    this.isActive = false;
    try {
      this.recognition.stop();
    } catch (e) {}
  }

  public updateLanguage(newLang: SupportedLanguage) {
    this.lang = newLang;
    if (this.recognition) {
      this.recognition.lang = newLang;
    }
  }
}
