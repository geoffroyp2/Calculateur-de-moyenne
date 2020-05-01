import React, {useState, useCallback} from 'react';

import Select from './Select';

const Calculateur = ({data}) => {
    const {filieres, matieres} = data;
    const [filiere, changeFiliere] = useState(filieres[0]);
    const [obligatoire, changeObligatoire] = useState(filieres[0].obl[0]);
    const [specialite, changeSpecialite] = useState(filieres[0].spe[0]);

    const onChangeFiliere = useCallback((evt) => {
        const newFiliere = filieres.filter((fil) => fil.nom === evt.target.value);

        if (newFiliere.length === 0) {
            throw new Error("No filiere found");
        }

        changeFiliere(newFiliere[0]);
    }, [filieres]);

    const onChangeObligatoire = useCallback((evt) => changeObligatoire(evt.target.value), []);
    const onChangeSpecialite = useCallback((evt) => changeSpecialite(evt.target.value), []);

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
                <div><b>Epreuves anticipées</b></div>
                {filiere.mat.filter((mat) => mat.an === "PREM").map((mat) => {
                    return <div key={mat.id}>{matieres[mat.id]}</div>;
                })}
            </div>
            
            <div>
                <div><b>Epreuves Terminales</b></div>
                {filiere.mat.filter((mat) => mat.an === "TERM").map((mat) => {
                    return <div key={mat.id}>{matieres[mat.id]}</div>;
                })}
            </div>

            <div>
                <div><b>Options</b></div>
                
            </div>
        </div>
    );
};

export default Calculateur;