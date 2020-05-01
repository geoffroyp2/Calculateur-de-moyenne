import React, { Component } from "react";
import data from './data.json';
import './App.css';

/* Organisation des composants :
    le document data.json contient toutes les infos de filières, matières, etc...

    Calculateur -> Obligatoire -> Specialite -> Matieres -> Resultat
    Le changement d'un composant force toujours le re-render des composants qu'il contient
   
    Calculateur possède le menu déroulant de choix de filière
    Obligatoire possède le menu déroulant de choix de matière obligatoire 
      (vide si la filière n'a pas de matière obligatoire) 
    Specialite possède le menu déroulant de choix de matière de spé
      (vide si la filière n'a pas de matière de spé)
    Matieres possède le tableau de matières et le bouton calculer
    Resultat apparaît quand on clique sur le bouton de Matieres
      c'est Resultat qui calcule et affiche le total


    TODO :
      - Se moquer de Geoffroy qui sait pas coder
      - Remplir les autres filières
      - Vérifier (et rajouter) s'il existe des cas particulier auxquels j'ai pas pensé
      - Rendre les input-fields et listes déroulantes plus jolies/utilisables (par exemple changer les zones de texte en input de nombres entre 0 et 20)
      - CSS (mais seulement si vous trouvez le design html pur trop rétro)
      - Rajouter du texte / mise en page, etc...
      - le reste de la page autour de l'appli Calculateur
*/

class Calculateur extends Component {
  constructor(props) {
    super(props);
    this.state = { filiere: "0" };
  }

  // Re-render avec l'appel de this.setState() quand une autre option est selectionnée
  handleChange() {
    let idx = document.getElementById('filSelect').selectedIndex;
    let filId = document.getElementById('filSelect')[idx].id.slice(1); //pour enlever le 'F' de la clé
    this.setState({ filiere: filId })
  }

  render() {
    //Création du menu déroulant
    let listeDeFilieres = [];
    for (let i = "0"; i <= "5"; i++)
      listeDeFilieres.push(<option key={`F${i}`} id={`F${i}`}> {data[i].fil} </option>);

    return (
      <>
        <div>
          <label>Filière&nbsp;</label>
          <select id={"filSelect"} onChange={() => this.handleChange()}>
            {listeDeFilieres}
          </select>
        </div>
        <Obligatoire
          // le random() est très moche, mais ça permet de forcer un re-render du composant à chaque fois
          key={Math.random()}
          // le contenu des menus déroulants est toutjours passé aux composants suivants
          filiere={this.state.filiere}
        />
      </>
    );
  }
};
export default Calculateur;

class Obligatoire extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // null si data[filiere].obl est vide, sinon la valeur par défaut est la première
      obl: data[this.props.filiere].obl[0] || null
    };
  }

  // tous les handleChange() fonctionnent pareil
  handleChange() {
    let idx = document.getElementById('oblSelect').selectedIndex;
    let oblId = document.getElementById('oblSelect')[idx].id.slice(1);
    this.setState({
      obl: oblId
    });
  }

  render() {
    //Génération du menu déroulant
    let content = data[this.props.filiere];
    let ensObligatoire;
    if (content.obl.length > 0) {
      let ensOblArr = [];
      for (let i of content.obl)
        ensOblArr.push(<option key={`O${i}`} id={`O${i}`}> {data.mat[i]} </option>);
      ensObligatoire =
        <div>
          Enseignement obligatoire :&nbsp;
        <select id={"oblSelect"} onChange={() => this.handleChange()}>
            {ensOblArr}
          </select>
        </div>;
    }

    return (
      <>
        {ensObligatoire}
        <Specialite
          key={Math.random()}
          filiere={this.props.filiere}
          obl={this.state.obl}
        />
      </>
    );
  }
};

//Specialité est quasi-identique à Obligatoire
class Specialite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spe: data[this.props.filiere].spe[0] || null
    };
  };

  handleChange() {
    let idx = document.getElementById('speSelect').selectedIndex;
    let speId = document.getElementById('speSelect')[idx].id.slice(1);
    this.setState({
      spe: speId
    });
  }

  render() {
    let content = data[this.props.filiere];
    let ensSpecialise;
    if (content.spe.length > 0) {
      let ensSpeArr = [];
      for (let i of content.spe)
        ensSpeArr.push(<option key={`O${i}`} id={`O${i}`}> {data.mat[i]} </option>);
      // pour la filière S : si il y a un enseignement obligatoire, alors il peut être choisi en spécialité
      if (this.props.obl !== undefined)
        ensSpeArr.push(<option key={`O${this.props.obl}`} id={`O${this.props.obl}`}> {data.mat[this.props.obl]} </option>);
      ensSpecialise =
        <div>
          Enseignement de spécialité :&nbsp;
          <select id={"speSelect"} onChange={() => this.handleChange()}>
            {ensSpeArr}
          </select>
        </div>;
    }

    return (
      <>
        {ensSpecialise}
        <Matieres
          key={Math.random()}
          filiere={this.props.filiere}
          obl={this.props.obl}
          spe={this.state.spe}
        />
      </>
    );
  }
};

class Matieres extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resultat: false // pour le rendu du résultat seulement si le bouton a été cliqué
    };
  };

  // Comme handleChange()
  handleClick() {
    this.setState({
      resultat: true
    });
  }

  render() {
    let content = data[this.props.filiere];
    let obl = this.props.obl, spe = this.props.spe;

    // Rendu des séparateurs entre matières de première, terminale et optionnelles
    let titres = ["Epreuves anticipées", "Epreuves Terminales", "Options"];
    let matieresArr = [];
    for (let i of titres) {
      matieresArr.push(
        [
          <tr>
            <td>{i}</td>
            <td>Coefficient</td>
            <td>Note</td>
          </tr>
        ]
      );
    }

    //Rendu de la liste de matières
    let count = 0, coefficients = [];
    let contenu = function (i, type) {
      let texteMatiere;
      if (type) {
        //Pour la série S : SVT, SI et EAT s'excluent mutuellement en fonction de l'enseignement obligatoire
        if (i.an === "TERM" && content.obl.includes(i.id))
          if (i.id !== obl)
            return;

        //Revoir la mise en page :)
        texteMatiere =
          <>
            {data.mat[i.id]}
            <br />{i.type}
          </>;
      } else {
        //les menus déroulants des matières optionnelles
        let matList = [];
        for (let j of data.mat[i.id])
          matList.push(<option key={`OP${j + count}`}> {j} </option>);
        texteMatiere = <select>{matList}</select>;
      }

      // affichage des coefficients en fonction de la valeur de base + choix d'options
      // certaines matières ont un coef de base de 0, et n'apparaissent que si elles sont choisies en option
      let coef = i.coef;
      if (i.id === spe)
        coef += 2;
      if (coef === 0)
        return;
      // les infos de coefficients sont gardées en mémoire pour le calcul de la note finale 
      // avec les ids des champs où les notes seront renseignées. Parce-que c'est plus simple.
      coefficients[count] = {
        coef: coef, bonus: i.bonus, id: `NOTE${count + 1}`
      };
      if (i.bonus)
        coef = <em>{coef} (bonus)</em>
      count++;

      return (
        < tr >
          <td>{texteMatiere}</td>
          <td>{coef}</td>
          <td><input type="text" key={`NOTE${count}`} id={`NOTE${count}`} ></input></td>
        </tr >
      );
    }

    //pour mettre chacune des lignes au bon endroit du tableau. 
    // Le true/false pour que les options soient rendues sous forme de menu déroulant
    for (let i of content.mat) {
      switch (i.an) {
        case "PREM": matieresArr[0].push(contenu(i, true)); break;
        case "TERM": matieresArr[1].push(contenu(i, true)); break;
        case "OPT": matieresArr[2].push(contenu(i, false)); break;
        default: break;
      }
    }

    // le résultat est vide tant que le bouton n'a pas été cliqué
    let resultat;
    if (this.state.resultat)
      resultat =
        <Resultat
          key={Math.random()}
          coef={coefficients}
        />;

    return (
      <>
        <table>
          <tbody>
            {matieresArr}
          </tbody>
        </table>
        <button onClick={() => this.handleClick()}>Calculer</button>
        {resultat}
      </>
    );
  }
};

class Resultat extends Component {
  render() {
    // Calcul de la note finale
    let total = 0, coefTotal = 0;
    for (let i of this.props.coef) {
      total += (+document.getElementById(i.id).value * i.coef) || 0;
      if (!i.bonus)
        coefTotal += i.coef;
    }
    let note = `${(total / coefTotal).toFixed(2)}/20`;

    return (
      <div>
        Note finale : {note}
        <br />Total de points: { total} / {coefTotal * 20}
      </div >
    );
  }
}