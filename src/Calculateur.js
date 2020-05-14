import React, { useState, useCallback } from 'react';

import Select from './Select';
import data from './data.json';

import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { BsInfoCircle } from 'react-icons/bs';

/*
A INSTALLER

npm install react-bootstrap bootstrap
npm install react-icons --save

TODO:
-- Bac TMD et STAV
-- Latin et Grec coef 3 si choisi en option 1

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
    const def = 0;
    const { filieres, matieres, info } = data;
    const [filiere, changeFiliere] = useState(filieres[def]);
    const [obligatoire, changeObligatoire] = useState(() => { let x = filieres[def].mat.find(i => i.obl); return x ? x.id : null; });
    const [specialite, changeSpecialite] = useState(() => { let x = filieres[def].mat.find(i => i.spe); return x ? x.id : null; });
    const [option1, changeOption1] = useState(filieres[def].OPT[0]);
    const [option2, changeOption2] = useState(filieres[def].OPT[1]);
    const [notes, changeNotes] = useState({});
    const [avg, changeAvg] = useState(0);
    const [EPS, changeEPS] = useState(false);

    const onChangeFiliere = useCallback((evt) => {
        const newFiliere = filieres.filter((fil) => fil.nom === evt.target.value);

        if (newFiliere.length === 0) {
            throw new Error("No filiere found");
        }

        changeFiliere(newFiliere[0]);

        // Pour tout reset quand on change de filliere (pour pas avoir de valeur résiduelle) 
        changeObligatoire(() => { let x = newFiliere[0].mat.find(i => i.obl); return x ? x.id : null; });
        changeSpecialite(() => { let x = newFiliere[0].mat.find(i => i.spe); return x ? x.id : null; });
        changeOption1(newFiliere[0].OPT[0]);
        changeOption2(newFiliere[0].OPT[1]);
        changeNotes({});
        changeAvg(0);
        changeEPS(false);
    }, [filieres]);

    const calculateMoyenne = useCallback(() => {
        const moyenne = (
            filiere.mat.reduce((acc, mat) => {
                if (mat.bonus) { // Pour les matières bonus (TPE & Options)
                    let coef = mat.coef;
                    if (mat.id === "OPT1" && (option1 === "Latin" || option1 === "Grec")) { // si Latin ou Grec le coef est de 3.
                        coef += 1;
                    }

                    return (notes[mat.id] || 0) <= 10 ? acc : acc + coef * (notes[mat.id] - 10); //Seulement les notes au-dessus de 10
                } else {
                    return mat.obl && (obligatoire !== mat.id) ? //ne compter que la matière obligatoire choisie
                        acc :
                        acc + (mat.coef + (mat.id === specialite ? mat.spebonus : 0)) * (notes[mat.id] || 0); // appliquer les coef bonus
                }
            }, 0)
            /
            filiere.mat.reduce((acc, mat) => {
                return mat.bonus || (mat.obl && obligatoire !== mat.id) ? // ni les obligatoires non-choisies ni les bonus
                    acc :
                    acc + mat.coef + (mat.id === specialite ? mat.spebonus : 0); // coef + coef de spé si nécessaire
            }, 0)
        ).toFixed(2);

        changeAvg(moyenne);
    }, [filiere.mat, notes, obligatoire, option1, specialite]);

    const onChangeObligatoire = useCallback((evt) => {
        changeObligatoire(Object.entries(matieres).find(i => i[1] === evt.target.value)[0]); //Il y a surement plus simple ;D
        changeNotes({});
    }, [matieres]);

    const onChangeSpecialite = useCallback((evt) => {
        changeSpecialite(Object.entries(matieres).find(i => i[1] === evt.target.value)[0]);
        changeNotes({});
    }, [matieres]);

    const onChangeEPS = useCallback((evt) => {
        changeEPS(evt.target.checked);
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
            calculateMoyenne();
        }
    }, [option1, option2, calculateMoyenne]);

    const onSubmit = useCallback((e) => {
        e.preventDefault();

        calculateMoyenne();
    }, [calculateMoyenne]);

    return (
        <div className="container">
            <h1 className="text-center pt-3 pb-3">Calculateur de moyenne du Bac</h1>
            <div className="border border-primary rounded shadow-lg p-md-3 p-2 m-1 m-md-3">
                <div> {/* Je sépare le label du select custom pour pouvoir gérer la mise en page*/}
                    <label className="pr-3">Filière :</label>
                    <Select
                        onChange={onChangeFiliere}
                        value={filiere.nom}
                        values={filieres.map(i => i.nom)}
                    />
                </div>
                {obligatoire ?
                    <div>
                        <label className="pr-3">Enseignement obligatoire :</label>
                        <Select
                            onChange={onChangeObligatoire}
                            value={matieres[obligatoire]}
                            values={filiere.mat.filter(i => i.obl).map(i => matieres[i.id])}
                        />
                    </div>
                    :
                    null
                }
                {specialite ?
                    <div>
                        <label className="pr-3">Enseignement de spécialité : </label>
                        <Select
                            onChange={onChangeSpecialite}
                            value={matieres[specialite]}
                            values={filiere.mat.filter(i => (i.spe && !i.obl) || (i.id === obligatoire)).map(i => matieres[i.id])}
                        />
                    </div>
                    :
                    null
                }
            </div>

            <div className="border border-primary rounded shadow-lg p-md-3 p-1 m-1 m-md-3">
                <form onSubmit={onSubmit}>
                    <Table className="table-bordered table-striped table-responsive table-responsive-xs" size={`sm`}>
                        {[...Array(3)].map((_, idx) =>
                            <React.Fragment key={`tableau${idx}`}>
                                <thead>
                                    <tr>
                                        <th colSpan="3" className="h4 font-weight-bold pb-2 pt-2">
                                            {["Epreuves anticipées", "Epreuves Terminales", "Options"][idx]}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="matiere h5 font-weight-normal-plus">Matière</th>
                                        <th className="coefficient h5 font-weight-normal-plus">
                                            <span className="d-none d-sm-block">Coefficient</span>
                                            <span className="d-block d-sm-none">Coef</span>
                                        </th>
                                        <th className="note h5 font-weight-normal-plus">Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filiere.mat.filter((mat) => mat.an === ["PREM", "TERM", "OPT"][idx]).map((mat) => {
                                        let coef = mat.id === specialite ? mat.coef + mat.spebonus : mat.coef;
                                        if (mat.id === "EPS" && EPS) coef += 2;
                                        if (coef !== 0 && (!mat.obl || (mat.obl && obligatoire === mat.id))) {
                                            return (
                                                <tr key={mat.id}>
                                                    <td className="matiere pb-0 pt-1">
                                                        {filiere.nom === "Bac STL" && mat.spe ? //Petit cas relou
                                                            <span className="float-left pl-1 pr-1">{"Chimie, biochimie, sciences du vivant et " + matieres[mat.id]}</span>
                                                            :
                                                            <span className="float-left pl-1 pr-1">{matieres[mat.id]}</span>
                                                        }
                                                        {idx < 2 ?
                                                            <span className="float-right text-muted pl-1 pr-2">
                                                                <span className="d-none d-sm-block">
                                                                    {mat.info ?
                                                                        <OverlayTrigger
                                                                            placement={`left`}
                                                                            overlay={<Tooltip id={`${mat.id}info`}>{info[mat.info]}</Tooltip>}
                                                                        >
                                                                            <BsInfoCircle className="pr-1" />
                                                                        </OverlayTrigger>
                                                                        : null
                                                                    }
                                                                    {mat.type}
                                                                </span>
                                                            </span>
                                                            :
                                                            <span className="pl-1">
                                                                <Select
                                                                    className="options"
                                                                    onChange={onChangeOption(parseInt(mat.id[3], 10))}
                                                                    value={mat.id[3] === '1' ? option1 : option2}
                                                                    values={filiere.OPT}
                                                                />
                                                                {mat.info ?
                                                                    <span className="float-right text-muted pl-1 pr-2">
                                                                        <OverlayTrigger
                                                                            placement="left"
                                                                            overlay={<Tooltip id={`${mat.id}info`}>{info[mat.info]}</Tooltip>}
                                                                        >
                                                                            <BsInfoCircle className="pr-1" />
                                                                        </OverlayTrigger>
                                                                    </span>
                                                                    : null
                                                                }
                                                            </span>
                                                        }
                                                        {mat.id === 'EPS' ?
                                                            <div className="pt-2 pl-2"><p />
                                                                <Form.Check
                                                                    className="eps-section"
                                                                    type="switch"
                                                                    id="EPS-switch"
                                                                    label="EPS de complément"
                                                                    onChange={onChangeEPS}
                                                                    checked={EPS}
                                                                /></div>
                                                            :
                                                            null
                                                        }
                                                    </td>
                                                    <td className="coefficient pb-0 pt-1">
                                                        {mat.id === "OPT1" && (option1 === "Latin" || option1 === "Grec") ? coef + 1 : coef}
                                                    </td>
                                                    <td className="note pb-0 pt-1">
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
                    <div className="pl-3 pb-3">
                        <button type="submit" onClick={onSubmit} className="btn-primary btn-sm shadow">Calculer</button>
                    </div>
                </form>

                <div className={`alert ${avg > 10 ? "alert-success" : "alert-danger"} p-2`}>
                    <span className="pr-3"> Moyenne :</span>
                    <span>{avg} / 20</span>
                    <div>Plus d'infos <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" rel="noopener noreferrer" target="_blank">ici</a></div>
                </div>
            </div>
        </div >
    );
};

export default Calculateur;