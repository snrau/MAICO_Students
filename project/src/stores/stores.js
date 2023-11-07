import { writable, get, derived } from 'svelte/store';
import { mean, polygonHull, scaleLinear } from 'd3'
import { getSelectedMelodies } from '../util/visutil';
import { distanceMatrix } from '../util/drutil';
import { averageOfGlyphs, calcInformation, calcVariancesCluster, getMiddlePosition, calcModelFromCluster } from '../util/glyphutil';
import { axisoptions, axisoptionsCor, keysLookup } from './globalValues';

let oldAxis = [{ value: 0, label: 'DR' }, { value: 0, label: 'DR' }, false]

let cpointchanged = []

let permutation = []

function createModelList() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        get: (n) => get(n),
        add: (model) => update(n => {
            model.index = n.length;
            return [...n, model]
        }),
        setAll: (models) => set(models),
        deleteIndex: (index) => update(n => {
            n.splice(index, 1);
            return n
        }),
        deleteName: (model) => update(n => n.filter((value, index, arr) => { return value.name !== model })),
        addMelodiesToModel: (model, melodies) => update(n => {
            n.forEach(obj => {
                if (obj.name === model) {
                    obj.melodies = melodies
                }
            })
            return n
        }),
        appendMelodiesToModel: (model, melodies) => update(n => {
            n.forEach(obj => {
                if (obj.name === model) {
                    obj.melodies = obj.melodies.concat(melodies)
                }
            })
            return n
        }),
        reset: () => set([]),
    };
}

export const models = createModelList();
export default models

export const DRumap = writable({ label: "UMAP", value: true })


function createAxis() {
    const { subscribe, set, update } = writable([{ value: 2, label: 'DR' }, { value: 2, label: 'DR' }, true]);

    return {
        subscribe,
        get: (n) => get(n),
        updateAxis: (axis, num, a2, num2) => update(n => {
            if (axis === true) {
                oldAxis = { ...n }
                if (!get(DRumap).value) {
                    if (!get(grid)) {
                        n[0] = { value: 0, label: 'DR' }
                        n[1] = { value: 0, label: 'DR' }
                    } else {
                        n[0] = { value: 1, label: 'DR' }
                        n[1] = { value: 1, label: 'DR' }
                    }
                } else {
                    if (!get(grid)) {
                        n[0] = { value: 2, label: 'DR' }
                        n[1] = { value: 2, label: 'DR' }
                    } else {
                        n[0] = { value: 3, label: 'DR' }
                        n[1] = { value: 3, label: 'DR' }
                    }
                }
                n[2] = true
            } else {
                if (n[2] && n[0].value < 4 && num > 1) {
                    n = { ...oldAxis }
                } else {
                    n[2] = false
                    n[num] = { value: axis.value, label: axis.label }
                    if (a2 !== undefined && a2 !== null)
                        n[num2] = { value: a2.value, label: a2.label }
                }

            }
            return n
        })
    };
}

export const glyphselect = writable({ value: 0, label: 'Points' })

export const glyphmodelselect = writable({ value: 0, label: 'Correlation' })

export const grid = writable(false)

export const keydetectselect = writable({ value: 0, label: 'Temperley adapted' })

export const glyphsize = writable(0.3)

export const repsize = writable(0.3)

export const similarityweight = writable(0.5)

export const glyphinclude = writable(false)

export const emotionbased = writable({ label: "Similarity", value: false })

export const vorcolorselect = writable({ value: 0, label: 'Temperature' })

export const pointcolorselect = writable({ value: 0, label: 'Model' })

export const side = writable(500)

function createRate() {
    const { subscribe, set, update } = writable({});

    return {
        subscribe,
        get: (n) => get(n),
        setOpt: (option, point, setnew) => update(n => {
            let e = n[point.model.name]
            if (setnew) {
                if (Array.isArray(e)) {
                    let find = e.filter(p => p.index === point.index)
                    if (find.length === 0)
                        e.push(point)
                    else
                        e[e.indexOf(find[0])].userspecific.rate = option
                } else
                    n[point.model.name] = [point]
            } else {
                if (Array.isArray(e)) {
                    const index = e.indexOf(point)
                    if (index !== -1) {
                        e.splice(index, 1);
                    }
                }
            }
            return n
        })
    };
}

export const rate = createRate()

export const seen = writable([])

export const seenratemode = writable(false)

export const axisselect = createAxis()

export const points = writable(undefined)

export const correlationData = derived(
    [points, models],
    s => {
        if (s[0] !== undefined) {
            let corData = new Array(s[1].length).fill([])
            corData.forEach((a, i) => {
                corData[i] = [[], [], [], [], []]
            })

            s[0].forEach((p, i) => {
                const modelIndex = s[1].findIndex((m) => m.name === p[2].model.name)
                for (let i = 0; i < axisoptionsCor.length; i++) {
                    corData[modelIndex][i].push(p[2].visdata[0][i + 4])
                }
            })
            return corData
        } else {
            return null
        }
    }
)


export const brushselection = writable(null)

export const recompute = writable(true)

export const meloselected = writable(null)

export const modelselected = writable(null)

export const somethingChanged = writable(false)

export const clusterslicer = writable(0.3)

export const clusterrepresentative = writable(0.3)

export const setcpoints = writable(null)

export const selectkey = writable(0)

export const keymode = writable(false)

export const primerkey = writable(true)

export const outercircle = writable(true)

export const filtersim = writable([[0, 1], [0, 1]])

export const filternumbernotes = writable([[0, 8], [0, 8]])

export const filterinscale = writable([[0, 1], [0, 1]])

export const filtervarint = writable([[0, 1], [0, 1]])

export const filterkey = writable(12)

export const seenfilter = writable(0);
export const listenfilter = writable(0);
export const tufilter = writable(false);
export const tdfilter = writable(false);


export const currentpoints = derived(
    [points, modelselected, setcpoints, filtersim, filternumbernotes, filterinscale, filtervarint, filterkey, seenfilter, tufilter, tdfilter, listenfilter],
    $stores => {
        permutation = new Array($stores[0]).fill(null)
        if ($stores[2] !== null && $stores[2] !== cpointchanged) {
            $stores[2].forEach((p, i) => {
                permutation[i] = p[2].index
            })
            cpointchanged = [...$stores[2]]
            return $stores[2]
        } else if ($stores[0] !== null && $stores[0] !== undefined) {
            let temp = $stores[0]?.filter((point) => $stores[1] !== null ? $stores[1][point[2].model.name] : true)
                // similarity filter
                .filter((point) => point[2].additional.similarityprimer >= $stores[3][0][0] && point[2].additional.similarityprimer <= $stores[3][0][1])
                // number notes
                .filter((point) => point[2].melody.notes.length >= $stores[4][0][0] && point[2].melody.notes.length <= $stores[4][0][1])
                // inscale filter
                .filter((point) => point[2].visdata[0][8] >= $stores[5][0][0] && point[2].visdata[0][8] <= $stores[5][0][1])
                // variance of intervals filter
                .filter((point) => point[2].visdata[0][6] >= $stores[6][0][0] && point[2].visdata[0][6] <= $stores[6][0][1])
                // key_tonic filter
                .filter((point) => point[2].additional?.key?.tonic === keysLookup[$stores[7]] || point[2].additional?.altkeys?.findIndex($stores[7]) > -1 || point[2].additional?.altkeys?.findIndex($stores[7] + 12) > -1 || $stores[7] === 12)
                // seenfilter
                .filter((point) => $stores[8] === 0 || (point[2].userspecific.seen > 0 && ($stores[8] === 1)) || (point[2].userspecific.seen === 0 && ($stores[8] === -1)))
                // ratefilter
                .filter((point) => (!$stores[9] && !$stores[10]) || ($stores[9] && point[2].userspecific.rate === 1) || ($stores[10] && point[2].userspecific.rate === -1))
                // listenfilter
                .filter((point) => $stores[11] === 0 || point[2].userspecific.seen === $stores[11] || (point[2].userspecific.seen < 2 && $stores[11] === -2))

            temp.forEach((p, i) => {
                permutation[i] = p[2].index
            })
            return temp
        } else {
            return []
        }
    }
);

function createColor() {
    const { subscribe, set, update } = writable([{ name: 'Color', scale: (i) => null }]);

    return {
        subscribe,
        set,
        addColorscale: (name, scale) => update(n => {
            n = [...n, { name: name, scale: scale }]
            return n
        })
    };
}

export const modeactive = writable(false)

export const currentcolor = derived(
    pointcolorselect,
    $pointcolorselect => {
        return $pointcolorselect.value
    }
)
export const colors = createColor()

export const lensmode = writable(false)

export const modelpointsavg = derived(
    [models, points, colors],
    s => {
        if (s[0] !== null && s[0] !== undefined && s[1] !== null && s[1] !== undefined) {
            const data = {}
            s[0].forEach((model, mindex) => {
                const fill = s[2].length > 0 ? s[2][0].scale(model) : '#111'
                const tp = s[1].filter((p) => p[2].model.name === model.name);
                if (tp.length > 0)
                    data[model.name] = averageOfGlyphs(tp, fill)
                else
                    data[model.name] = null
            })
            return data
        } else {
            return null
        }
    }
)


function createCluster() {
    const { subscribe, set, update } = writable({ points: [], numberCluster: 0 });

    return {
        subscribe,
        get: (n) => get(n),
        setCluster: (a1, a2) => {
            let temp = { points: [], numberCluster: Math.max(...a1) + 1 }
            a1.forEach((v, i) => {
                temp.points.push({ index: i, cluster: v, color: a2[i] })
            })
            set(temp)
        }
    };
}

export const cluster = createCluster()


function createClusterRep() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        get: (n) => get(n),
        setClusterRep: (a1, a2) => {
            let temp = []
            a1.forEach((v, i) => {
                temp.push({ index: i, cluster: v, color: a2[i] })
            })
            set(temp)
        }
    };
}

export const clusterrep = createClusterRep()

function createbcScwitch() {
    const { subscribe, set, update } = writable(false);

    return {
        subscribe,
        get: (n) => get(n),
        switch: () => {
            update(n => !n)
            clusterSelect.set(null)
        }
    };
}

export const brushClusterSwitch = createbcScwitch()
export const repSwitch = createbcScwitch()

export const clusterdata = derived(
    [currentpoints, cluster, axisselect],
    $stores => {
        if ($stores[0] !== null && $stores[0] !== undefined && $stores[1].numberCluster > 0) {
            let temp = new Array($stores[1].numberCluster)

            let hullpoints = new Array($stores[1].numberCluster).fill([])
            let hulls = new Array($stores[1].numberCluster).fill({ clusterindex: 0, hullpoints: [], containpoints: [], color: null })
            let hullcolor = new Array($stores[1].numberCluster).fill(null)
            let toCluster
            // @ts-ignore

            $stores[0].forEach((point, i) => {
                toCluster = $stores[1].points.filter((c) => { return point[2].index === c.index })
                if (toCluster.length > 0) {
                    hullpoints[toCluster[0].cluster] = hullpoints[toCluster[0].cluster].concat([point])
                    if (hullcolor[toCluster[0].cluster] === null)
                        hullcolor[toCluster[0].cluster] = toCluster[0].color
                }
            })
            let hulltemp = null
            hullpoints.forEach((points, i) => {
                const thispoints = points.map(p => [p[0][$stores[2][0].value], p[1][$stores[2][1].value]])
                hulltemp = polygonHull(thispoints)
                if (hulltemp === null && thispoints.length === 2) {
                    hulltemp = thispoints
                }
                hulls[i] = { clusterindex: i, hullpoints: hulltemp, containpoints: points, color: hullcolor[i] }
            })

            return hulls
        } else {
            return []
        }
    }
);


export const clipPadding = writable(40)

export const tooltipSel = writable(null)

export const distMatrix = writable(undefined)


export const representatives = derived(
    [clusterdata, clusterrep, distMatrix, repSwitch],
    $stores => {
        if ($stores[0]?.length > 0 && $stores[1]?.length > 0) {
            const cluster = $stores[0]
            const rep = $stores[1]
            let temp = new Array(cluster.length).fill({ clusterindex: 0, representatives: null })
            cluster.forEach((v, i) => {
                if (v.hullpoints !== null && v.hullpoints.length > 2) {
                    let thispoints = v.containpoints.map(cpoint => rep[cpoint[2].index])
                    let color = thispoints[0].color
                    let repclusternums = thispoints.map(cpoint => cpoint.cluster).filter((value, index, array) => array.indexOf(value) === index)
                    let subcluster = new Array(repclusternums.length)
                    repclusternums.forEach((element, index) => {
                        let temp = v.containpoints.filter((cpoint) => {
                            return thispoints.filter((tp) => tp.cluster === element && tp.index === cpoint[2].index).length > 0
                        }).map((cpoint) => {
                            cpoint[2].repcolor = thispoints.filter((tp) => tp.cluster === element && tp.index === cpoint[2].index)[0].color
                            return cpoint
                        })
                        subcluster[index] = temp
                    });
                    let representative = new Array(repclusternums.length)
                    subcluster.forEach((points, index) => {
                        //calc one representative
                        if (!$stores[3]) {
                            //MCE
                            let max = [$stores[2].length, 0]
                            points.forEach((p, i) => {
                                const tindex = permutation.indexOf(p[2].index)
                                const tmax = $stores[2][tindex].reduce((a, b) => a + b, 0)
                                if (tmax < max[0]) {
                                    max[0] = tmax
                                    max[1] = i
                                }
                            })
                            representative[index] = points[max[1]]
                            representative[index][2].repposition = getMiddlePosition(points)
                        } else {
                            // average?
                            representative[index] = averageOfGlyphs(points, color)
                        }

                        representative[index][2].deviationHalo = calcVariancesCluster(points)
                        representative[index][2].modelpie = calcModelFromCluster(points)


                    })
                    temp[i] = { clusterindex: i, representatives: representative }
                } else {
                    temp[i] = { clusterindex: i, representatives: null }
                }
            })
            return temp
        }
    }
);

export const clusterSelect = writable(null)

export const selectedClusterData = derived(
    [clusterdata, clusterSelect],
    $stores => {
        if ($stores[0]?.length > 0 && $stores[1] !== null) {
            const cluster = $stores[0]
            const select = $stores[1]
            let temp = []

            cluster.forEach((v, i) => {
                if (select.filter(cs => cs[1] === i).length > 0) {
                    v.clusterData = calcInformation(v.containpoints)
                    temp.push(v)
                }
            })

            return temp
        } else {
            return []
        }
    }
)
// test

export const player = writable(null)