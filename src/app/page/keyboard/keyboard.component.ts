import { Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
import { ServiceSutomService } from 'src/app/services/service-sutom.service';
import { WORDS } from 'src/app/words';
const WORD_LENGTH = 8;
const NUM_TRIES = 6;

const LETTERS = (() => {
  // lettre -> true
  const ret: { [key: string]: boolean } = {};
  for (let charCode = 97; charCode < 97 + 26; charCode++) {
    ret[String.fromCharCode(charCode)] = true;
  }
  console.log(ret);
  return ret;
})();

interface Try {
  letters: Letter[];
}

// une lettre dans la ronde
interface Letter {
  text: string;
  state: LetterState;
}

enum LetterState {
  WRONG,
  // une lettre trouvé à la mauvaise position
  PARTIAL_MATCH,
  // bien trouvé
  FULL_MATCH,
  PENDING,
}

@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent {
  @ViewChildren('tryContainer') tryContainers!: QueryList<ElementRef>;
  userName: string | null = null;
  
  readonly keyboardRows = [
    ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
    ['W', 'X', 'C', 'V', 'B', 'N', 'SUPPRIMER', 'VALIDER']
  ];

  private won = false;

  // ------- modal -------
  infoMsg = '';
  // disparition animation modal
  fadeOutInfoMessage = false;

  showShareDialogContainer = false;
  showShareDialog = false;

  // ---- recuperation du nom d'utilisateur pour modal
  ngOnInit(): void {
    this.getUserName();
  }

  getUserName(): void {
    this.userName = this.serviceSutomService.getUserName();
  }
  
  // stockage des mots
  private targetWord = '';
   //stocker un nombre pour chaque lettre dans le mot ciblé
    //ex. pour mot happy 'h':1, 'a':1, 'p':2,'y':1
  private targetWordLetterCounts: {[letter: string]: number} = {};

  // tracer index courant
  private curLetterIndex = 0;
  private numSubmittedTries = 0;
  
  
  // stocker tous les rondes
  // une ronde est un rangé
  readonly tries: Try[] = [];
  //pour rendre LetterState enum accessible
  readonly LetterState = LetterState;
  //stocker etat de clavier indexé
  readonly curLetterStates: {[key: string]: LetterState} = {};
  
  //-----constructor--------
  constructor(private serviceSutomService: ServiceSutomService) {
    //---------- liste des mots -------------
    // Obtenir un mot dans la liste de mots.
    const numWords = WORDS.length;
    while (true) {
        // sélection aléatoire d'un mot avec la vérification si sa longueur correspond à la longueur du mot ciblé
        const index = Math.floor(Math.random() * numWords);
        const word = WORDS[index];
        if (word.length === WORD_LENGTH) {
            this.targetWord = word.toLowerCase();
            break;
        }
    }
    console.log('target word: ', this.targetWord);

    // Initialiser la première rangée avec la première lettre du mot
    const firstLetters: Letter[] = [];
    for (let j = 0; j < WORD_LENGTH; j++) {
        if (j === 0) {
            // Si c'est la première case, assignez la première lettre du mot
            firstLetters.push({ text: this.targetWord[0], state: LetterState. FULL_MATCH, });
        } else {
            // Pour les autres cas, initialisez avec des lettres vides
            firstLetters.push({ text: '', state: LetterState.PENDING });
        }
    }
    this.tries.push({ letters: firstLetters });

    // Initialiser les autres rangées avec des lettres vides
    for (let i = 1; i < NUM_TRIES; i++) {
        const letters: Letter[] = [];
        for (let j = 0; j < WORD_LENGTH; j++) {
            letters.push({ text: '', state: LetterState.PENDING });
        }
        this.tries.push({ letters });
    }
// Obtenir les lettres pour le mot ciblé
    this.targetWordLetterCounts = {};
    for (const letter of this.targetWord) {
        const count = this.targetWordLetterCounts[letter];
        if (count == null) {
            this.targetWordLetterCounts[letter] = 0;
        }
        this.targetWordLetterCounts[letter]++;
    }
    console.log('target word:', this.targetWordLetterCounts);
}

  
@HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handleClickKey(event.key);
  }
  // Returns the classes for the given keyboard key based on its state.
   getKeyClass(key: string): string {
    const state = this.curLetterStates[key.toLowerCase()];
    switch (state) {
      case LetterState.FULL_MATCH:
        return 'match key';
      case LetterState.PARTIAL_MATCH:
        return 'partial key';
      case LetterState.WRONG:
        return 'wrong key';
      default:
        return 'key';
    }
  }

  private handleClickKey(key: string) {
     if (LETTERS[key.toLowerCase()]) {
      // Commencer à partir de la deuxième case lors du premier essai
    if (this.numSubmittedTries === 0 && this.curLetterIndex === 0) {
      this.curLetterIndex = 1;
    }
    if (this.curLetterIndex < (this.numSubmittedTries + 1) * WORD_LENGTH) {
      this.setLetter(key);
      this.curLetterIndex++;
    }
    }

    // --------supprimer-----
    //'Backspace' est basé sur la touche du clavier standard 
    else if (key === 'Backspace') {
      
    // ne pas supprimer la lettre d'avant
      if (this.curLetterIndex > this.numSubmittedTries * WORD_LENGTH) {
        this.curLetterIndex--;
        this.setLetter(' ');
      }
    }
    // soumettre l'essai actuel et vérifier
    else if (key === 'Enter') {
      this.checkCurrentTry();
    }
  }

  handleClickShare() {
   
    // Copy results into clipboard.
    let clipboardContent = '';
    for (let i = 0; i < this.numSubmittedTries; i++) {
      const tryLetters = this.tries[i].letters;
      for (let j = 0; j < WORD_LENGTH; j++) {
        const letter = tryLetters[j];
        switch (letter.state) {
          case LetterState.FULL_MATCH:
            clipboardContent += '🟥';
            break;
          case LetterState.PARTIAL_MATCH:
            clipboardContent += '🟨';
            break;
          case LetterState.WRONG:
            clipboardContent += '🟦';
            break;
          default:
            break;
        }
      }
      clipboardContent += '\n';
    }
  
    console.log(clipboardContent);
  
    navigator.clipboard.writeText(clipboardContent).then(() => {
      this.showShareDialogContainer = false;
      this.showShareDialog = false;
      this.showInfoMessage('Copied results to clipboard');
    }).catch((error) => {
      console.error('Error copying to clipboard:', error);
      this.showInfoMessage('Error copying results to clipboard');
    });
  }
  
   private setLetter(letter: string) {
    const tryIndex = Math.floor(this.curLetterIndex / WORD_LENGTH);
    const letterIndex = this.curLetterIndex - tryIndex * WORD_LENGTH;
    this.tries[tryIndex].letters[letterIndex].text = letter;
     
    console.log('Lettre selectionné:', letter);
  }
//-------------
  private async checkCurrentTry() {
    console.log('Entering checkCurrentTry');
    // vérifier si utilisateur a mis toutes les lettres
    const curTry = this.tries[this.numSubmittedTries];
    if (curTry.letters.some(letter => letter.text === '')) {
      this.showInfoMessage('nombre de lettres pas suffisante');
      return;
    }
    // vérifier si le mot est sur la liste des mots
    const wordFromCurTry =
      curTry.letters.map(letter => letter.text).join('').toUpperCase();
    if (!WORDS.includes(wordFromCurTry)) {
      this.showInfoMessage('Ne pas sur la liste');
      // Shake the current row.
      const tryContainer =
        this.tryContainers.get(this.numSubmittedTries)?.nativeElement as 
        HTMLElement;
        if (this.numSubmittedTries === 0) {
// Si c'est le premier essai, montrer la première lettre du mot dans la première case
          const firstLetterEle = tryContainer.querySelector('.letter-container');
          if (firstLetterEle) {
            firstLetterEle.classList.add('fold');
            await this.wait(180);
            curTry.letters[0].state = LetterState.PENDING; // remettre à l'état initial
            firstLetterEle.classList.remove('fold');
            await this.wait(180);
          }
        }
      tryContainer.classList.add('shake');
      setTimeout(() => {
        tryContainer.classList.remove('shake');
      }, 500);
      return;
    }
  
  //clonner
  const targetWordLetterCounts = { ...this.targetWordLetterCounts };

  //stocker le résultat vérifié
  const states: LetterState[] = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
    const expected = this.targetWord[i];
    const curLetter = curTry.letters[i];
    const got = curLetter.text.toLowerCase();
    let state = LetterState.WRONG;
    //controler uniquement des lettres qui n'étaient pas encore utilisés
    if (expected === got && targetWordLetterCounts[got] > 0) {
      targetWordLetterCounts[expected]--;
      state = LetterState.FULL_MATCH;
    } else if (
      this.targetWord.includes(got) && targetWordLetterCounts[got] > 0) {
      targetWordLetterCounts[got]--
      state = LetterState.PARTIAL_MATCH;
    }
    states.push(state);
   }
   console.log('Before logging states');
   console.log(states);
  
   // l'essai actuel
   const tryContainer =
       this.tryContainers.get(this.numSubmittedTries)?.nativeElement as
       HTMLElement;
   // un element lettre
   const letterEles = tryContainer.querySelectorAll('.letter-container');
   for (let i = 0; i < letterEles.length; i++) {
     // application du résultat avec mis à jour du style
     const curLetterEle = letterEles[i];
     curLetterEle.classList.add('fold');
     // attent dev la fin de l'animation 
     await this.wait(180);
     // mis à jour d'état et du style
     curTry.letters[i].state = states[i];
     // arret deroulement 
     curLetterEle.classList.remove('fold');
     await this.wait(180);
   }

   // Enregistrer des états des touches du clavier.
   for (let i = 0; i < WORD_LENGTH; i++) {
     const curLetter = curTry.letters[i];
     const got = curLetter.text.toLowerCase();
     const curStoredState = this.curLetterStates[got];
     const targetState = states[i];
     //remplacer l'état avec un meilleur résultat.
     //si "A" était une correspondance partielle lors de l'essai précédent et devient complet
     // correspond à l'essai en cours, 
     //mis à jour de l'état de la clé avec la correspondance complète (sa valeur enum est plus grande)
     if (curStoredState == null || targetState > curStoredState) {
       this.curLetterStates[got] = targetState;
     }
   }

   this.numSubmittedTries++;

   // Vérification si toutes les lettres de l'essai en cours sont correctes.
   if (states.every(state => state === LetterState.FULL_MATCH)) {
     this.showInfoMessage('NICE!');
     this.won = true;
     //  animation
     for (let i = 0; i < letterEles.length; i++) {
       const curLetterEle = letterEles[i];
       curLetterEle.classList.add('bounce');
       await this.wait(160);
     }
     this.showShare();
     return;
   }

   //montrer la bonne réponse
   if (this.numSubmittedTries === NUM_TRIES) {
     // Don't hide it.
     this.showInfoMessage(this.targetWord.toUpperCase(), false);
     this.showShare();
   }
 }

  // ------- Modal -----
  private showInfoMessage(msg: string, hide = true) {
    this.infoMsg = msg;
     setTimeout(() => {
      this.fadeOutInfoMessage = true;
      setTimeout(() => {
        this.infoMsg = '';
        this.fadeOutInfoMessage = false;
      }, 500);
    }, 5000);
  }
  
  modalVisible = true;
  closeInfoMsg() {
    this.modalVisible = false;
    
  }
  private async wait(ms: number) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    })
  }
  private showShare() {
    setTimeout(() => {
      this.showShareDialogContainer = true;
      setTimeout(() => {
        // Slide in the share dialog.
        this.showShareDialog = true;
      });
    }, 1500);
  }
}
