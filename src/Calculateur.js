import React, { useState, useCallback } from 'react';

import Select from './Select';
import data from './data.json';

import Table from 'react-bootstrap/Table'

/*
A INSTALLER

npm install react-bootstrap bootstrap

TODO:
-- Pour que ce soit plus lisible, on pourrait couper le code en sous-classes (notamment dans le tableau des matières)
-- Ajouter des infos pop-up pour expliquer le calcul des matières bonus
-- Ajouter des infos pour les mentions
-- Ajouter les autres filières
-- Avancer le CSS :
        -- gérer le re-size automatique pour que ce soit moins dégueu
        -- revoir les polices/tailles/couleurs de texte
        -- revoir les fonds/encadrés, etc
-- Vérifier les bugs et le calcul de la moyenne dans toutes les configurations de filières/obligatoire/spé
*/

const Calculateur = () => {
    const { filieres, matieres } = data;
    const [filiere, changeFiliere] = useState(filieres[0]);
    const [obligatoire, changeObligatoire] = useState(filieres[0].obl[0]);
    const [specialite, changeSpecialite] = useState(filieres[0].spe[0]);
    const [option1, changeOption1] = useState(filieres[0].OPT[0]);
    const [option2, changeOption2] = useState(filieres[0].OPT[1]);
    const [notes, changeNotes] = useState({});
    const [avg, changeAvg] = useState(0);

    const onChangeFiliere = useCallback((evt) => {
        const newFiliere = filieres.filter((fil) => fil.nom === evt.target.value);

        if (newFiliere.length === 0) {
            throw new Error("No filiere found");
        }

        changeFiliere(newFiliere[0]);

        // Pour tout reset quand on change de filliere (nécessaire pour l'affichage correct des select d'obligatoire/spé) 
        // Faut peut être reset tous les autres states aussi pour pas polluer le calcul de la note finale
        changeObligatoire(newFiliere[0].obl[0]);
        changeSpecialite(newFiliere[0].spe[0]);
    }, [filieres]);

    const calculateMoyenne = () => {
        const moyenne = (
            filiere.mat.reduce((acc, mat) => {
                const isObl = filiere.obl.includes(mat.id);
                if (mat.bonus) { // Pour les matières bonus (TPE & Options)
                    return (notes[mat.id] || 0) <= 10 ? acc : acc + mat.coef * (notes[mat.id] - 10); //Seulement les notes au-dessus de 10
                } else {
                    return isObl && obligatoire !== mat.id ? acc : acc + mat.coef * (notes[mat.id] || 0); //Seulement la matière obligatoire choisie
                }
            }, 0)
            /
            filiere.mat.reduce((acc, mat) => {
                const isObl = filiere.obl.includes(mat.id);
                return mat.bonus || (isObl && obligatoire !== mat.id) ? acc : acc + mat.coef; // les coefs des matières bonus ne s'ajoutent pas au total
            }, 0)
        ).toFixed(2);

        changeAvg(moyenne);
    };

    const onChangeObligatoire = useCallback((evt) => {
        changeObligatoire(Object.entries(matieres).find(i => i[1] === evt.target.value)[0]); //Il y a surement plus simple ;D
        changeNotes({});
    }, [matieres]);

    const onChangeSpecialite = useCallback((evt) => {
        changeSpecialite(Object.entries(matieres).find(i => i[1] === evt.target.value)[0]);
        changeNotes({});
    }, [matieres]);

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
            <h1 className={`text-center`}>Calculateur de moyenne</h1>
            <div className={`container border border-primary rounded shadow-lg p-3 m-3`}>
                <div className={``}> {/* Je sépare le label du select custom pour pouvoir gérer la mise en page*/}
                    <label className={`pr-3`}>Filière :</label>
                    <Select
                        className="" //class name du Select
                        onChange={onChangeFiliere}
                        value={filiere.nom}
                        values={filieres}
                        optionKey="nom"
                        optionLabel="nom"
                    />
                </div>
                {obligatoire ?
                    <div className={``}>
                        <label className={`pr-3`}>Enseignement obligatoire :</label>
                        <Select
                            className=""
                            onChange={onChangeObligatoire}
                            value={matieres[obligatoire]}
                            values={filiere.obl.map(id => matieres[id])}
                        />
                    </div> :
                    null
                }
                {specialite ?
                    <div className={``}>
                        <label className={`pr-3`}>Enseignement de spécialité : </label>
                        <Select
                            className=""
                            onChange={onChangeSpecialite}
                            value={matieres[specialite]}
                            values={filiere.spe.concat([obligatoire]).map(id => matieres[id])} // Pour ajouter la matière obligatoire au choix de spé
                        />
                    </div> :
                    null
                }
            </div>

            <div className={`container border border-primary rounded shadow-lg p-3 m-3`}>
                <form onSubmit={onSubmit}>
                    <Table className={`table-bordered table-striped`} size={`sm`}>
                        {[...Array(3)].map((elem, idx) =>
                            <React.Fragment key={`tableau${idx}`}>
                                <thead>
                                    <tr>
                                        <th colSpan="3" className={`h4 font-weight-bold pb-2 pt-2`}>
                                            {["Epreuves anticipées", "Epreuves Terminales", "Options"][idx]}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className={`h5 font-weight-normal`}>Matière</th>
                                        <th className={`h5 font-weight-normal`}>Coefficient</th>
                                        <th className={`h5 font-weight-normal`}>Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filiere.mat.filter((mat) => mat.an === ["PREM", "TERM", "OPT"][idx]).map((mat) => {
                                        const coef = mat.id === specialite ? mat.coef + 2 : mat.coef;
                                        const isObl = filiere.obl.includes(mat.id);
                                        if (coef !== 0 && (!isObl || (isObl && obligatoire === mat.id))) {
                                            return (
                                                <tr key={mat.id}>
                                                    <td className={`pb-0 pt-1`}>
                                                        <span className={`float-left pl-1 pr-1`}>{matieres[mat.id]}</span>
                                                        {idx < 2 ?
                                                            <span className={`float-right text-muted pl-1 pr-2`}>{mat.type}</span> :
                                                            <span className={`pl-1`}>
                                                                <Select
                                                                    className="options"
                                                                    onChange={onChangeOption(+mat.id[3])}
                                                                    value={mat.id[3] === '1' ? option1 : option2}
                                                                    values={filiere.OPT}
                                                                />
                                                            </span>
                                                        }
                                                    </td>
                                                    <td className={`pb-0 pt-1`}>
                                                        {coef}
                                                    </td>
                                                    <td className={`pb-0 pt-1`}>
                                                        <input type="number" min="0" max="20" onChange={(e) => {
                                                            changeNotes({ ...notes, [mat.id]: e.target.value });
                                                            calculateMoyenne();
                                                        }} />
                                                    </td>
                                                </tr>
                                            )
                                        } else return null;
                                    })}
                                </tbody>
                            </React.Fragment >
                        )}
                    </Table>
                    <div className={`pl-3 pb-3`}>
                        <button type="submit" onClick={onSubmit} className={`btn-primary btn-sm shadow`}>Calculer</button>
                    </div>
                </form>

                <div className={`alert ${avg > 10 ? `alert-success` : `alert-danger`} p-2`}>
                    <span className={`pr-3`}> Moyenne :</span>
                    <span>{avg} / 20</span>
                    <div>Plus d'infos <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">ici</a></div>
                </div>
            </div>
        </div >
    );
};

export default Calculateur;