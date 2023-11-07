import { saveAs } from 'file-saver'
import { Midi } from '@tonejs/midi'
import * as mm from '@magenta/music'

export function writeToMidi(melodies, bpm, mode){
        try {
          if (mainmelo.notes.length > 0) {
            const midi = new Midi()
            let newSec
            let sec
            for (let i = 0; i < 1; i++) { // mainmelo.notes.length;i++){
              newSec = mm.sequences.createQuantizedNoteSequence(4, bpm)
              newSec.notes = mainmelo.notes[i]
              sec = mm.sequences.unquantizeSequence(newSec, bpm)
              const track = midi.addTrack()
              sec.notes.forEach((note) => {
                track.addNote({
                  midi: note.pitch,
                  time: note.startTime,
                  duration: note.endTime - note.startTime
                })
              })
            }
            const array = midi.toArray()
            const buffer = array.buffer
            /* global Blob */
            const blob = new Blob([buffer], { type: 'audio/mid' })
            saveAs(blob, 'composedMidi.mid')
          }
        } catch (e) {
          console.log(e)
        }
}