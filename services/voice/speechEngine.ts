
import { SupportedLanguage } from '../../types';

export class SpeechEngine {
  private recognition: any;
  private isMuted: boolean = true;
  private isActive: boolean = false;
  private forceStop: boolean = false;

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
      if (final || interim) {
        this.onResult(final, interim);
      }
    };

    this.recognition.onerror = (e: any) => {
      if (e.error === 'no-speech') return;
      console.warn("Speech recognition error:", e.error);
      this.isActive = false;
      this.onError(e.error);
    };

    this.recognition.onend = () => {
      this.isActive = false;
      // Só reinicia se não houver pedido explícito de parada
      if (!this.isMuted && !this.forceStop) {
        try {
          this.recognition.start();
          this.isActive = true;
        } catch (err) {
          setTimeout(() => { if (!this.isMuted) this.start(); }, 300);
        }
      }
      this.onEnd();
    };
  }

  public start() {
    if (!this.recognition) return;
    this.isMuted = false;
    this.forceStop = false;
    if (this.isActive) return;
    
    try {
      this.recognition.start();
      this.isActive = true;
    } catch (e) {
      this.isActive = false;
    }
  }

  public stop() {
    this.isMuted = true;
    this.forceStop = true;
    this.isActive = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
        this.recognition.abort(); 
      } catch (e) {}
    }
  }

  public updateLanguage(newLang: SupportedLanguage) {
    this.lang = newLang;
    if (this.recognition) {
      this.recognition.lang = newLang;
    }
  }
}
