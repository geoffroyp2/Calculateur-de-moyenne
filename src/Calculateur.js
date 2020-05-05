import React, {useState, useCallback} from 'react';

import Select from './Select';
import data from './data.json';

const Calculateur = () => {
    const {filieres, matieres} = data;
    const [filiere, changeFiliere] = useState(filieres[0]);
    const [obligatoire, changeObligatoire] = useState(filieres[0].obl[0]);
    const [specialite, changeSpecialite] = useState(filieres[0].spe[0]);
    const [notes, changeNotes] = useState({});
    const [avg, changeAvg] = useState(0);

    const onChangeFiliere = useCallback((evt) => {
        const newFiliere = filieres.filter((fil) => fil.nom === evt.target.value);

        if (newFiliere.length === 0) {
            throw new Error("No filiere found");
        }

        changeFiliere(newFiliere[0]);
    }, [filieres]);

    const onChangeObligatoire = useCallback((evt) => changeObligatoire(evt.target.value), []);
    const onChangeSpecialite = useCallback((evt) => changeSpecialite(evt.target.value), []);
    const onSubmit = useCallback((e) => {
        e.preventDefault();

        console.log(specialite, obligatoire);
        const moyenne = (
            filiere.mat.reduce((acc, mat) => acc + mat.coef * (notes[mat.id] || 0), 0) /
            filiere.mat.reduce((acc, mat) => acc + mat.coef, 0)
        ).toFixed(2);

        changeAvg(moyenne);
    }, [notes, filiere.mat, specialite]);

    return (
        <div>
            <Select
                className="filiere"
                defaultValue={filiere.nom}
                label="Filière : "
                onChange={onChangeFiliere}
                values={filieres}
                optionKey="nom"
                optionLabel="nom"
            />
            <Select
                className="obligatoire"
                defaultValue={obligatoire}
                label="Enseignement obligatoire : "
                onChange={onChangeObligatoire}
                values={filiere.obl}
            />
            <Select
                className="specialite"
                defaultValue={specialite}
                label="Enseignement de spécialité : "
                onChange={onChangeSpecialite}
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
                                                <td>{matieres[mat.id]}</td>
                                                <td>{mat.coef}</td>
                                                <td><input type="number" min="0" max="20" onChange={(e) => changeNotes({...notes, [mat.id]: e.target.value})} /></td>
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
                                    {filiere.mat.filter((mat) => mat.an === "TERM").map((mat) => {
                                        const coef = mat.id === specialite ? mat.coef + 2 : mat.coef;

                                        return (
                                            <tr key={mat.id}>
                                                <td>{matieres[mat.id]}</td>
                                                <td>{coef}</td>
                                                <td><input type="number" min="0" max="20" onChange={(e) => changeNotes({...notes, [mat.id]: e.target.value})} /></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <div><b>Options</b></div>
                        
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