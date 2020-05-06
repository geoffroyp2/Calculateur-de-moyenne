import React, {useState, useCallback} from 'react';

import Select from './Select';
import data from './data.json';

const Calculateur = () => {
    const {filieres, matieres} = data;
    const [filiere, changeFiliere] = useState(filieres[0]);
    const [obligatoire, changeObligatoire] = useState(filieres[0].obl[0]);
    const [specialite, changeSpecialite] = useState(filieres[0].spe[0]);
    const [option1, changeOption1] = useState(matieres.OPS[0]);
    const [option2, changeOption2] = useState(matieres.OPS[1]);
    const [notes, changeNotes] = useState({});
    const [avg, changeAvg] = useState(0);

    const onChangeFiliere = useCallback((evt) => {
        const newFiliere = filieres.filter((fil) => fil.nom === evt.target.value);

        if (newFiliere.length === 0) {
            throw new Error("No filiere found");
        }

        changeFiliere(newFiliere[0]);
    }, [filieres]);

    const calculateMoyenne = () => {
        const moyenne = (
            filiere.mat.reduce((acc, mat) => {
                const id = mat.id;

                // exception du TPE
                if (id === "TPE" && notes[id] <= 10) {
                    return acc;
                }

                return acc + mat.coef * (notes[id] || 0);
            }, 0)
            /
            filiere.mat.reduce((acc, mat) => acc + mat.coef, 0)
        ).toFixed(2);

        changeAvg(moyenne);
    };

    const onChangeObligatoire = useCallback((evt) => {
        changeObligatoire(evt.target.value);
        changeNotes({});
    }, []);
    const onChangeSpecialite = useCallback((evt) => {
        changeSpecialite(evt.target.value);
        changeNotes({});
    }, []);
    const onChangeOption = useCallback((idx) => {
        // afin d'eviter que la personne selectionne deux fois la meme options.
        return (evt) => {
            const value = evt.target.value;

            if (idx === 1) {
                if (value === option2) {
                    changeOption2(option1);
                }

                changeOption1(value);
            }
            else {
                if (value === option1) {
                    changeOption1(option2);
                }

                changeOption2(value);
            }
        }
    }, [option1, option2]);
    const onSubmit = useCallback((e) => {
        e.preventDefault();

        calculateMoyenne();
    }, [notes, filiere.mat, specialite]);

    return (
        <div>
            <Select
                className="filiere"
                label="Filière : "
                onChange={onChangeFiliere}
                value={filiere.nom}
                values={filieres}
                optionKey="nom"
                optionLabel="nom"
            />
            <Select
                className="obligatoire"
                label="Enseignement obligatoire : "
                onChange={onChangeObligatoire}
                value={obligatoire}
                values={filiere.obl}
            />
            <Select
                className="specialite"
                label="Enseignement de spécialité : "
                onChange={onChangeSpecialite}
                value={specialite}
                values={filiere.spe}
            />

            <div>
                <form onSubmit={onSubmit}>
                    <div>
                        <div><b>Epreuves anticipées</b></div>
                        <div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Matieres</th>
                                        <th>Coefficient</th>
                                        <th>Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filiere.mat.filter((mat) => mat.an === "PREM").map((mat) => {
                                        return (
                                            <tr key={mat.id}>
                                                <td>
                                                    {matieres[mat.id]}
                                                </td>
                                                <td>
                                                    {mat.coef}
                                                </td>
                                                <td>
                                                    <input type="number" min="0" max="20" onChange={(e) => {
                                                        changeNotes({...notes, [mat.id]: e.target.value});
                                                        calculateMoyenne();
                                                    }} />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div>
                        <div><b>Epreuves Terminales</b></div>
                        <div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Matieres</th>
                                        <th>Coefficient</th>
                                        <th>Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filiere
                                        .mat
                                        .filter((mat) => {
                                            return mat.an === "TERM";
                                        })
                                        .map((mat) => {
                                            const coef = mat.id === specialite ? mat.coef + 2 : mat.coef;

                                            return (
                                                <tr key={mat.id}>
                                                    <td>
                                                        {matieres[mat.id]}
                                                    </td>
                                                    <td>
                                                        {coef}
                                                    </td>
                                                    <td>
                                                        <input type="number" min="0" max="20" onChange={(e) => {
                                                            changeNotes({...notes, [mat.id]: e.target.value});
                                                            calculateMoyenne();
                                                        }} />
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <div><b>Options</b></div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Matieres</th>
                                    <th>Coefficient</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr>
                                    <td>
                                        <Select
                                            className="options"
                                            label="Option 1 : "
                                            onChange={onChangeOption(1)}
                                            value={option1}
                                            values={matieres.OPS}
                                        />
                                    </td>
                                    <td>
                                        {filiere.mat.find((mat) => mat.id === "OPS1").coef}
                                    </td>
                                    <td>
                                        <input type="number" min="0" max="20" onChange={(e) => {
                                            changeNotes({...notes, OPS1: e.target.value});
                                            calculateMoyenne();
                                        }} />
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <Select
                                            className="options"
                                            label="Option 2 : "
                                            onChange={onChangeOption(2)}
                                            value={option2}
                                            values={matieres.OPS}
                                        />
                                    </td>
                                    <td>
                                        {filiere.mat.find((mat) => mat.id === "OPS2").coef}
                                    </td>
                                    <td>
                                        <input type="number" min="0" max="20" onChange={(e) => {
                                            changeNotes({...notes, OPS2: e.target.value});
                                            calculateMoyenne();
                                        }} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <button type="submit" onClick={onSubmit}>Submit</button>
                    </div>
                </form>
            </div>

            <div>
                <div>Moyenne: {avg > 0 && avg}</div>
            </div>
        </div>
    );
};

export default Calculateur;