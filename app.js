const { useState, useEffect } = React;

function App() {
  // --- ÉTATS (STATES) ---
  const [utilisateurActif, setUtilisateurActif] = useState({ id: 1, nom: "Frédéric" });
  const [livres, setLivres] = useState([]);
  const [livreSelectionneId, setLivreSelectionneId] = useState(null);
  const [chapitreSelectionneId, setChapitreSelectionneId] = useState(null);
  
  const [nouveauTitreLivre, setNouveauTitreLivre] = useState("");
  const [nouveauSynopsisLivre, setNouveauSynopsisLivre] = useState("");
  const [afficherFormLivre, setAfficherFormLivre] = useState(false);
  
  const [nouveauTitreChapitre, setNouveauTitreChapitre] = useState("");
  const [nouvelleLigneTexte, setNouvelleLigneTexte] = useState("");
  const [nouveauMessageDiscussion, setNouveauMessageDiscussion] = useState("");

  // --- INITIALISATION & LOCALSTORAGE ---
  useEffect(() => {
    const sauvegardes = localStorage.getItem("plume_collective_livres");
    if (sauvegardes) {
      try {
        const donnees = JSON.parse(sauvegardes);
        setLivres(donnees);
        if (donnees.length > 0) {
          setLivreSelectionneId(donnees[0].id);
          if (donnees[0].chapitres && donnees[0].chapitres.length > 0) {
            setChapitreSelectionneId(donnees[0].chapitres[0].id);
          }
        }
      } catch (e) {
        console.error("Erreur de chargement LocalStorage", e);
      }
    } else {
      const livreDemo = {
        id: Date.now(),
        titre: "Mon Premier Roman",
        synopsis: "Une histoire passionnante écrite en collaboration.",
        createur: "Frédéric",
        coAuteurs: [],
        statut: "en_cours",
        chapitres: [
          {
            id: Date.now() + 1,
            titre: "Chapitre 1 : Premier Pas",
            lignes: [
              { id: Date.now() + 2, auteur: "Frédéric", texte: "Le soleil se levait à peine sur la ville." }
            ]
          }
        ],
        discussionInterne: []
      };
      setLivres([livreDemo]);
      setLivreSelectionneId(livreDemo.id);
      setChapitreSelectionneId(livreDemo.chapitres[0].id);
    }
  }, []);

  const sauvegarderSurFirebase = (nouvelleListeLivres) => {
    setLivres(nouvelleListeLivres);
    localStorage.setItem("plume_collective_livres", JSON.stringify(nouvelleListeLivres));
  };

  // --- SELECTIONS ---
  const livreActif = livres.find(l => l.id === livreSelectionneId);
  const chapitreActif = livreActif?.chapitres?.find(c => c.id === chapitreSelectionneId);

  // --- ACTIONS LIVRES ---
  const ajouterLivre = (e) => {
    e.preventDefault();
    if (!nouveauTitreLivre.trim()) return;

    const nouveauLivreId = Date.now();
    const premierChapitreId = nouveauLivreId + 1;

    const nouveauLivre = {
      id: nouveauLivreId,
      titre: nouveauTitreLivre.trim(),
      synopsis: nouveauSynopsisLivre.trim() || "Aucun synopsis pour le moment.",
      createur: utilisateurActif.nom,
      coAuteurs: [],
      statut: "en_cours",
      chapitres: [
        { id: premierChapitreId, titre: "Chapitre 1 : Premier Pas", lignes: [] }
      ],
      discussionInterne: []
    };

    const maj = [...livres, nouveauLivre];
    sauvegarderSurFirebase(maj);
    setLivreSelectionneId(nouveauLivreId);
    setChapitreSelectionneId(premierChapitreId);
    setNouveauTitreLivre("");
    setNouveauSynopsisLivre("");
    setAfficherFormLivre(false);
  };

  const basculerStatutLivre = (livreId, e) => {
    e.stopPropagation();
    const maj = livres.map(l => {
      if (l.id !== livreId) return l;
      return { ...l, statut: l.statut === 'termine' ? 'en_cours' : 'termine' };
    });
    sauvegarderSurFirebase(maj);
  };

  const supprimerLivre = (livreId, titre, e) => {
    e.stopPropagation();
    if (window.confirm("Voulez-vous vraiment supprimer le livre \"" + titre + "\" ?")) {
      const maj = livres.filter(l => l.id !== livreId);
      sauvegarderSurFirebase(maj);
      if (maj.length > 0) {
        setLivreSelectionneId(maj[0].id);
        setChapitreSelectionneId(maj[0].chapitres[0]?.id || null);
      } else {
        setLivreSelectionneId(null);
        setChapitreSelectionneId(null);
      }
    }
  };

  // --- EXPORT WORD ---
  const exporterEnWord = (livre, e) => {
    e.stopPropagation();
    if (!livre) return;

    var chapitresHTML = "";
    (livre.chapitres || []).forEach(function(chapitre) {
      chapitresHTML += "<h2>" + chapitre.titre + "</h2>";
      (chapitre.lignes || []).forEach(function(ligne) {
        chapitresHTML += "<p>" + ligne.texte + "</p>";
      });
    });

    var contenuHTML = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + livre.titre + '</title><style>body { font-family: "Calibri", serif; line-height: 1.6; margin: 40px; } h1 { text-align: center; font-size: 28pt; } .auteur { text-align: center; font-style: italic; margin-bottom: 20pt; } .synopsis { background: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b; margin-bottom: 40pt; } h2 { font-size: 20pt; border-bottom: 1px solid #cbd5e1; margin-top: 30pt; } p { font-size: 12pt; text-indent: 20pt; text-align: justify; }</style></head><body><h1>' + livre.titre + '</h1><div class="auteur">Auteur : ' + livre.createur + '</div><div class="synopsis"><strong>Synopsis :</strong><br>' + livre.synopsis + '</div><hr>' + chapitresHTML + '</body></html>';

    try {
      if (window.htmlDocx && window.saveAs) {
        var converted = window.htmlDocx.asBlob(contenuHTML);
        var nomFichier = livre.titre.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.doc';
        window.saveAs(converted, nomFichier);
      } else {
        var blob = new Blob(['\ufeff' + contenuHTML], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = livre.titre.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.doc';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Erreur d'exportation :", err);
      alert("Erreur lors de l'exportation Word.");
    }
  };

  // --- ACTIONS CHAPITRES & TEXTE ---
  const ajouterChapitre = (e) => {
    e.preventDefault();
    if (!nouveauTitreChapitre.trim() || !livreActif) return;

    const nouveauChapitre = {
      id: Date.now(),
      titre: nouveauTitreChapitre.trim(),
      lignes: []
    };

    const maj = livres.map(l => {
      if (l.id !== livreActif.id) return l;
      return { ...l, chapitres: [...l.chapitres, nouveauChapitre] };
    });

    sauvegarderSurFirebase(maj);
    setChapitreSelectionneId(nouveauChapitre.id);
    setNouveauTitreChapitre("");
  };

  const ajouterLigne = (e) => {
    e.preventDefault();
    if (!nouvelleLigneTexte.trim() || !livreActif || !chapitreActif) return;

    const nouvelleLigne = {
      id: Date.now(),
      auteur: utilisateurActif.nom,
      texte: nouvelleLigneTexte.trim()
    };

    const maj = livres.map(l => {
      if (l.id !== livreActif.id) return l;
      const chapitresMaj = l.chapitres.map(c => {
        if (c.id !== chapitreActif.id) return c;
        return { ...c, lignes: [...c.lignes, nouvelleLigne] };
      });
      return { ...l, chapitres: chapitresMaj };
    });

    sauvegarderSurFirebase(maj);
    setNouvelleLigneTexte("");
  };

  const ajouterMessageDiscussion = (e) => {
    e.preventDefault();
    if (!nouveauMessageDiscussion.trim() || !livreActif) return;

    const nouveauMessage = {
      id: Date.now(),
      auteur: utilisateurActif.nom,
      texte: nouveauMessageDiscussion.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const maj = livres.map(l => {
      if (l.id !== livreActif.id) return l;
      return { ...l, discussionInterne: [...(l.discussionInterne || []), nouveauMessage] };
    });

    sauvegarderSurFirebase(maj);
    setNouveauMessageDiscussion("");
  };

  // --- RENDU (UI) ---
  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <header className="bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">✒️</span>
          <h1 className="text-xl font-bold tracking-wide">Plume Collective</h1>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-800 px-3 py-1.5 rounded-full text-sm">
          <span>👤</span>
          <span className="font-medium">{utilisateurActif.nom}</span>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden">
        {/* BARRE LATÉRALE */}
        <aside className="w-80 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold text-lg">Bibliothèque</h2>
            <button 
              onClick={() => setAfficherFormLivre(!afficherFormLivre)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-sm transition"
            >
              {afficherFormLivre ? "Annuler" : "+ Nouveau"}
            </button>
          </div>

          {afficherFormLivre && (
            <form onSubmit={ajouterLivre} className="p-4 bg-slate-800 border-b border-slate-700 space-y-3">
              <input
                type="text"
                placeholder="Titre du livre..."
                value={nouveauTitreLivre}
                onChange={(e) => setNouveauTitreLivre(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                required
              />
              <textarea
                placeholder="Synopsis..."
                value={nouveauSynopsisLivre}
                onChange={(e) => setNouveauSynopsisLivre(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-400 h-20 focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded text-sm font-medium transition">
                Créer le livre
              </button>
            </form>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {livres.map(livre => {
              const estSelectionne = livre.id === livreSelectionneId;
              return (
                <div
                  key={livre.id}
                  onClick={() => {
                    setLivreSelectionneId(livre.id);
                    setChapitreSelectionneId(livre.chapitres[0]?.id || null);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition flex flex-col justify-between ${
                    estSelectionne ? "bg-indigo-800 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-base leading-snug">{livre.titre}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        livre.statut === 'termine' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
                      }`}>
                        {livre.statut === 'termine' ? 'Terminé' : 'En cours'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{livre.synopsis}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center text-xs">
                    <span>✍️ {livre.createur}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => basculerStatutLivre(livre.id, e)}
                        title="Changer statut"
                        className="p-1 hover:bg-slate-600 rounded"
                      >
                        {livre.statut === 'termine' ? '🔄' : '✅'}
                      </button>
                      <button
                        onClick={(e) => exporterEnWord(livre, e)}
                        title="Exporter Word (.doc)"
                        className="p-1 hover:bg-slate-600 rounded text-amber-400"
                      >
                        📄
                      </button>
                      <button
                        onClick={(e) => supprimerLivre(livre.id, livre.titre, e)}
                        title="Supprimer"
                        className="p-1 hover:bg-red-800 rounded text-red-400"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ZONE PRINCIPALE */}
        {livreActif ? (
          <main className="flex-1 flex flex-col bg-amber-50/30 overflow-hidden">
            <div className="bg-white border-b border-slate-200 p-4 shadow-sm flex justify-between items-center">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <span className="text-slate-400 font-medium text-sm mr-2">Chapitres :</span>
                {livreActif.chapitres?.map(chapitre => (
                  <button
                    key={chapitre.id}
                    onClick={() => setChapitreSelectionneId(chapitre.id)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      chapitre.id === chapitreSelectionneId
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {chapitre.titre}
                  </button>
                ))}
              </div>

              <form onSubmit={ajouterChapitre} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Nouveau chapitre..."
                  value={nouveauTitreChapitre}
                  onChange={(e) => setNouveauTitreChapitre(e.target.value)}
                  className="px-2.5 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm transition">
                  +
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
              <div className="bg-white rounded-xl shadow-md border border-slate-200/80 p-8 min-h-full flex flex-col">
                <div className="border-b border-slate-200 pb-4 mb-6">
                  <h1 className="text-3xl font-serif font-bold text-slate-900">{livreActif.titre}</h1>
                  <p className="text-slate-500 italic text-sm mt-1">Par {livreActif.createur}</p>
                  <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 text-amber-900 text-sm rounded">
                    <strong>Synopsis :</strong> {livreActif.synopsis}
                  </div>
                </div>

                {chapitreActif ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-serif font-bold text-indigo-900 mb-4 pb-2 border-b border-slate-100">
                        {chapitreActif.titre}
                      </h2>

                      <div className="space-y-4 font-serif text-lg leading-relaxed text-slate-800">
                        {chapitreActif.lignes?.length > 0 ? (
                          chapitreActif.lignes.map(ligne => (
                            <p key={ligne.id} className="relative group pl-4 border-l-2 border-transparent hover:border-indigo-300 transition">
                              {ligne.texte}
                              <span className="text-xs font-sans text-slate-400 ml-2 opacity-0 group-hover:opacity-100 transition">
                                — {ligne.auteur}
                              </span>
                            </p>
                          ))
                        ) : (
                          <p className="text-slate-400 italic text-base font-sans">
                            Ce chapitre est encore vide. Écrivez le premier paragraphe ci-dessous !
                          </p>
                        )}
                      </div>
                    </div>

                    <form onSubmit={ajouterLigne} className="mt-8 pt-4 border-t border-slate-200">
                      <label className="block text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Ajouter une contribution à ce chapitre
                      </label>
                      <div className="flex space-x-2">
                        <textarea
                          rows="3"
                          placeholder="Écrivez la suite de l'histoire ici..."
                          value={nouvelleLigneTexte}
                          onChange={(e) => setNouvelleLigneTexte(e.target.value)}
                          className="flex-1 p-3 border border-slate-300 rounded-lg font-serif focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans px-5 rounded-lg font-medium shadow transition flex items-center justify-center"
                        >
                          Publier
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Veuillez sélectionner ou créer un chapitre.</p>
                )}
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 flex items-center justify-center text-slate-400">
            <p>Sélectionnez ou créez un livre dans le menu de gauche.</p>
          </main>
        )}

        {/* PANNEAU DE DISCUSSION */}
        {livreActif && (
          <aside className="w-80 bg-white border-l border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-700 flex items-center space-x-2">
                <span>💬</span>
                <span>Discussion d'auteurs</span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {livreActif.discussionInterne?.length > 0 ? (
                livreActif.discussionInterne.map(msg => (
                  <div key={msg.id} className="bg-slate-100 p-2.5 rounded-lg text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-800 text-xs">{msg.auteur}</span>
                      <span className="text-slate-400 text-[10px]">{msg.date}</span>
                    </div>
                    <p className="text-slate-700">{msg.texte}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center mt-4">
                  Aucune note d'équipe pour l'instant.
                </p>
              )}
            </div>

            <form onSubmit={ajouterMessageDiscussion} className="p-3 border-t border-slate-200 flex space-x-2">
              <input
                type="text"
                placeholder="Laissez un mot aux co-auteurs..."
                value={nouveauMessageDiscussion}
                onChange={(e) => setNouveauMessageDiscussion(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs transition">
                Envoi
              </button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);