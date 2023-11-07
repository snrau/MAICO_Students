// @ts-ignore
import { models, modelselected } from '../stores/stores.js'
import { iter, genlength } from '../stores/devStores.js'
import { get } from 'svelte/store';
// @ts-ignore
import * as mm from '@magenta/music'
import * as Tonal from '@tonaljs/tonal'

export async function addModel(model) {
    try {
        // resolve import meta glob to load files
        async function importAll(r) {
            let files = []
            for (const fileMatch of Object.values(r)) {
                const fileContents = await fileMatch()
                files.push(fileContents.default)
            }
            return files
        }

        if (model === undefined) {
            const files = import.meta.glob("../checkpoints/*.json");//require.context('./checkpoints', false, /\.json$/)
            let loadedModels = await importAll(files)
            models.setAll(loadedModels)
        } else {

        }
    } catch (e) {
        console.log(e)
    }
}


// maybe add information of the model, temperature etc -> could also be a store
export function flattenAllMelodies() {
    let melodies = []
    let information = { model: '', temperature: 1 }
    get(models).filter((model) => model?.melodies?.length > 0 && get(modelselected)[model.name])
        .forEach(model => model.melodies.forEach(melo => {
            information = { model: model, temperature: melo.temperature }
            melodies.push([melo, information])
        }))
    return melodies
}

export async function uploadDatasetFile(event) {
    try {
        const reader = new FileReader();
        reader.readAsText(event.target.files[0], "UTF-8");
        reader.onload = function (evt) {
            const obj = JSON.parse(String(evt.target.result))
            console.log(obj)
            models.setAll(obj)
        }
    } catch (e) {
        console.log(e)
    }
}

export async function requestModels(allprimer) {
    let resultdata = {}
    const rnnSteps = get(genlength)
    let tempArray = []
    let starting = Array.from({ length: 15 }, (_, i) => Math.round((i / 10 + 0.2) * 100) / 100) //Array.from({ length: 15 }, (_, i) => Math.round((i / 10 + 0.2) * 100) / 100)
    for (let i = 0; i < get(iter); i++) {
        tempArray = tempArray.concat(starting)
    }
    tempArray.sort((a, b) => a - b)
    const numOut = tempArray.length
    try {
        await get(models).forEach(async (model, index) => {

            const checkpointURL = model.checkpointURL
            console.log(checkpointURL)
            // for testing as it is not set up

                if (!model.js ){ //&& false) {
                    allprimer.forEach(async (primer, index) =>{
                        const request = { tempos: [{ qpm: 120 }], notes: primer.notes, totalQuantizedSteps: primer.totalQuantizedSteps, flags: [{}] }

                        const possibleFlags = { numOut: numOut, numSteps: rnnSteps, temperature: tempArray }

                        for (const [key, value] of Object.entries(model.fixflags[0])) {
                            request.flags[0][key] = value
                        }
                        for (const [key, value] of Object.entries(model.needflags[0])) {
                            if (possibleFlags[value] !== undefined) { request.flags[0][key] = possibleFlags[value] }
                        }
                        try {
                            /* global fetch */
                            fetch(checkpointURL, {
                                method: 'POST',
                                headers: {
                                    'Access-Control-Allow-Origin': '*',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(request)
                            }).then(res => res.json()).then(
                                data => {
                                    console.log(data)
                                    data.melodies.forEach(m => {
                                        m.primer = primer
                                    })
                                    if(index === 0)
                                        models.addMelodiesToModel(model.name, data.melodies)
                                    else
                                        models.appendMelodiesToModel(model.name, data.melodies)
                                })
                        } catch (e) {
                            console.log(e)
                        }
                    })
                } else if (model.js && model.name !== 'improv_rnn') {
                    let dataArray = []
                    allprimer.forEach(async (primer, index) =>{
                        const request = mm.sequences.createQuantizedNoteSequence()
                        request.tempos[0].qpm = 120
                        request.notes = primer.notes
                        request.totalQuantizedSteps = primer.totalQuantizedSteps
                        request.flags = [{}]
                        // for improv RNN important to put in spec
                        let musicRnn = new mm.MusicRNN(checkpointURL)
                        musicRnn.initialize()

                        const chord = getChord(request.notes, model.name === 'improv_rnn')
                        for (let i = 0; i < numOut; i++) {
                            // chord needs to be calculated for some models
                            await musicRnn
                                .continueSequence(request, rnnSteps, tempArray[i], chord)
                                .then((data) => {
                                    data = data.toJSON()
                                    data.temperature = tempArray[i]
                                    data.primer = primer
                                    dataArray.push(data)
                                    if (dataArray.length == numOut && index === allprimer.length - 1) {
                                        console.log(model.name + ' finished')
                                        models.addMelodiesToModel(model.name, dataArray)
                                    }
                                    return data
                                })
                        }
                    })
                } else {
                    models.addMelodiesToModel(model.name, [])
                }
        });
    } catch (e) {
        console.log(e)
    }
    return resultdata
}

function getChord(notes, flag) {
    if (!flag)
        return undefined

    function first(array) {
        if (array !== undefined && array.length > 0) {
            const common = Tonal.Chord.detect(array)
            return common.length ? common[0] : array[0]
        } else {
            return 'CM'
        }
    }
    function detectChord(notes) {
        notes = notes.map(n => Tonal.Note.pitchClass(Tonal.Note.fromMidi(n.pitch))).sort()
        return Tonal.PcSet.modes(notes)
            .map((mode, i) => {
                const tonic = Tonal.Note.name(notes[i])
                const names = Tonal.ChordDictionary.symbols(mode)
                return names.length ? tonic + names[0] : null
            })
            .filter((v, i, a) => a.indexOf(v) === i)
    }

    const notes1 = notes
    const chords = detectChord(notes1)
    console.log(chords)
    const chord = first(chords)
    return [chord]
}


export function deleteModel() {
    models.deleteIndex(-1)
}

function getModel(name, models) {
    return get(models).filter((value => {
        return value.name === name
    }))
}

function replace(key, value) {
    if (key === "totalQuantizedSteps" || key === 'quantizedEndStep' || key === 'quantizedStartStep') {
        let change = parseInt(value);
        return change;
    }
    return value;
}

/**
 * if(modelname === undefined){
        data.forEach(model=>{
            model.melodies.forEach(mel => {
                mel = mel.toJSON()
                mel.totalQuantizedSteps = parseInt(mel.totalQuantizedSteps)
                mel.notes.forEach(note => {
                    note.quantizedStartStep = parseInt(note.quantizedStartStep)
                    note.quantizedEndStep = parseInt(note.quantizedEndStep)
                })
            })
        })
    }
 */

export function exportModelJson(modelname) {
    const data = modelname !== undefined ? getModel(modelname, models)[0] : get(models)
    const jsonString = JSON.stringify(data, replace, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = modelname || 'dataset' + '.json'
    link.click()
    URL.revokeObjectURL(url)
}

export function getIndexbyModelname(n) {
    let result = null
    let counter = 0
    get(models).forEach((obj, index) => {
        if (obj?.name == n && obj?.melodies?.length === 0) {
            return null
        }else if(obj?.name == n){
            result = counter
        }else if(obj?.melodies?.length > 0){
            counter++
        }
    })
    return result
}

// export { addModel, requestModel };
