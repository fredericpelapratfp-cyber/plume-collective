const { useState, useEffect } = React;

function App() {
  // --- ÉTATS (STATES) ---
  const [utilisateurActif, setUtilisateurActif] = useState({ id: 1, nom: "Frédéric" });
  const [livres, setLivres] = useState([]);
  const [livreSelectionneId, setLivreSelectionneId] = useState(null);
  const [chapitreSelectionneId, setChapitreSelectionneId] = useState(null);
  
  // Onglet actif pour mobile/Spck ('bibliotheque', 'redaction', 'discussion')
  const [ongletMobile, setOngletMobile] = useState("redaction");

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
    setOngletMobile("redaction");
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
      var blob = new Blob(['\ufeff' + contenuHTML], { type: 'application/msword' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = livre.titre.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.doc';
      a.click();
      URL.revokeObjectURL(url);
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
    <div className="flex flex-col h-screen overflow-hidden">
      {/* HEADER */}
      <header className="bg-indigo-900 text-white p-3 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-xl">✒️</span>
          <h1 className="text-lg font-bold tracking-wide">Plume Collective</h1>
        </div>
        <div className="flex items-center space-x-1 bg-indigo-800 px-2.5 py-1 rounded-full text-xs">
          <span>👤</span>
          <span className="font-medium">{utilisateurActif.nom}</span>
        </div>
      </header>

      {/* CONTENU PRINCIPAL Responsive */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* BARRE LATÉRALE (BIBLIOTHÈQUE) */}
        <aside className={`w-full md:w-80 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0 ${
          ongletMobile === 'bibliotheque' ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="p-3 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold text-base">Bibliothèque</h2>
            <button 
              onClick={() => setAfficherFormLivre(!afficherFormLivre)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-xs transition"
            >
              {afficherFormLivre ? "Annuler" : "+ Nouveau"}
            </button>
          </div>

          {afficherFormLivre && (
            <form onSubmit={ajouterLivre} className="p-3 bg-slate-800 border-b border-slate-700 space-y-2">
              <input
                type="text"
                placeholder="Titre du livre..."
                value={nouveauTitreLivre}
                onChange={(e) => setNouveauTitreLivre(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                required
              />
              <textarea
                placeholder="Synopsis..."
                value={nouveauSynopsisLivre}
                onChange={(e) => setNouveauSynopsisLivre(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-xs text-white placeholder-slate-400 h-16 focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-1 rounded text-xs font-medium transition">
                Créer le livre
              </button>
            </form>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {livres.map(livre => {
              const estSelectionne = livre.id === livreSelectionneId;
              return (
                <div
                  key={livre.id}
                  onClick={() => {
                    setLivreSelectionneId(livre.id);
                    setChapitreSelectionneId(livre.chapitres[0]?.id || null);
                    setOngletMobile("redaction");
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition flex flex-col justify-between ${
                    estSelectionne ? "bg-indigo-800 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm leading-snug">{livre.titre}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        livre.statut === 'termine' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
                      }`}>
                        {livre.statut === 'termine' ? 'Terminé' : 'En cours'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{livre.synopsis}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between items-center text-xs">
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

        {/* ZONE PRINCIPALE (RÉDACTION) */}
        <main className={`flex-1 flex-col bg-amber-50/30 overflow-hidden w-full ${
          ongletMobile === 'redaction' ? 'flex' : 'hidden md:flex'
        }`}>
          {livreActif ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* BARRE DES CHAPITRES */}
              <div className="bg-white border-b border-slate-200 p-2 shadow-sm flex items-center justify-between overflow-x-auto shrink-0">
                <div className="flex items-center space-x-1 overflow-x-auto">
                  {livreActif.chapitres?.map(chapitre => (
                    <button
                      key={chapitre.id}
                      onClick={() => setChapitreSelectionneId(chapitre.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition ${
                        chapitre.id === chapitreSelectionneId
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {chapitre.titre}
                    </button>
                  ))}
                </div>

                <form onSubmit={ajouterChapitre} className="flex items-center space-x-1 ml-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Nouveau chap..."
                    value={nouveauTitreChapitre}
                    onChange={(e) => setNouveauTitreChapitre(e.target.value)}
                    className="w-24 sm:w-32 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                  />
                  <button type="submit" className="bg-indigo-600 text-white px-2 py-1 rounded text-xs">
                    +
                  </button>
                </form>
              </div>

              {/* EDITEUR DE TEXTE */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-xl shadow-md border border-slate-200/80 p-4 md:p-8 min-h-full flex flex-col justify-between">
                  <div>
                    <div className="border-b border-slate-200 pb-3 mb-4">
                      <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">{livreActif.titre}</h1>
                      <p className="text-slate-500 italic text-xs mt-0.5">Par {livreActif.createur}</p>
                      <div className="mt-2 p-2.5 bg-amber-50 border-l-4 border-amber-400 text-amber-900 text-xs rounded">
                        <strong>Synopsis :</strong> {livreActif.synopsis}
                      </div>
                    </div>

                    {chapitreActif ? (
                      <div>
                        <h2 className="text-lg md:text-xl font-serif font-bold text-indigo-900 mb-3 pb-1 border-b border-slate-100">
                          {chapitreActif.titre}
                        </h2>

                        <div className="space-y-3 font-serif text-base md:text-lg leading-relaxed text-slate-800">
                          {chapitreActif.lignes?.length > 0 ? (
                            chapitreActif.lignes.map(ligne => (
                              <p key={ligne.id} className="relative group pl-3 border-l-2 border-indigo-200 md:border-transparent md:hover:border-indigo-300 transition">
                                {ligne.texte}
                                <span className="text-xs font-sans text-slate-400 ml-2 block sm:inline">
                                  — {ligne.auteur}
                                </span>
                              </p>
                            ))
                          ) : (
                            <p className="text-slate-400 italic text-sm font-sans">
                              Ce chapitre est encore vide. Écrivez le premier paragraphe ci-dessous !
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic text-sm">Veuillez sélectionner ou créer un chapitre.</p>
                    )}
                  </div>

                  {chapitreActif && (
                    <form onSubmit={ajouterLigne} className="mt-6 pt-3 border-t border-slate-200">
                      <label className="block text-[10px] font-sans font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Ajouter un paragraphe
                      </label>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <textarea
                          rows="2"
                          placeholder="Écrivez la suite de l'histoire ici..."
                          value={nouvelleLigneTexte}
                          onChange={(e) => setNouvelleLigneTexte(e.target.value)}
                          className="flex-1 p-2.5 border border-slate-300 rounded-lg font-serif focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans px-4 py-2 rounded-lg font-medium shadow transition text-sm"
                        >
                          Publier
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 p-4 text-center text-sm">
              Sélectionnez ou créez un livre dans la bibliothèque.
            </div>
          )}
        </main>

        {/* PANNEAU DE DISCUSSION */}
        <aside className={`w-full md:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 ${
          ongletMobile === 'discussion' ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-700 text-sm flex items-center space-x-2">
              <span>💬</span>
              <span>Discussion d'auteurs</span>
            </h3>
          </div>

          {livreActif ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {livreActif.discussionInterne?.length > 0 ? (
                  livreActif.discussionInterne.map(msg => (
                    <div key={msg.id} className="bg-slate-100 p-2 rounded-lg text-xs">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-slate-800">{msg.auteur}</span>
                        <span className="text-slate-400 text-[9px]">{msg.date}</span>
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

              <form onSubmit={ajouterMessageDiscussion} className="p-2 border-t border-slate-200 flex space-x-1.5 bg-white">
                <input
                  type="text"
                  placeholder="Votre message..."
                  value={nouveauMessageDiscussion}
                  onChange={(e) => setNouveauMessageDiscussion(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs transition">
                  Envoi
                </button>
              </form>
            </div>
          ) : (
            <div className="p-4 text-xs text-slate-400 text-center italic">
              Sélectionnez un livre pour voir sa discussion.
            </div>
          )}
        </aside>

      </div>

      {/* BARRE DE NAVIGATION NATIVE MOBILE (Visible uniquement sur mobile / petits écrans) */}
      <nav className="md:hidden bg-slate-900 border-t border-slate-800 flex justify-around p-2 shrink-0">
        <button
          onClick={() => setOngletMobile('bibliotheque')}
          className={`flex flex-col items-center text-xs ${
            ongletMobile === 'bibliotheque' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-base">📚</span>
          <span>Livres</span>
        </button>
        <button
          onClick={() => setOngletMobile('redaction')}
          className={`flex flex-col items-center text-xs ${
            ongletMobile === 'redaction' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-base">✍️</span>
          <span>Rédaction</span>
        </button>
        <button
          onClick={() => setOngletMobile('discussion')}
          className={`flex flex-col items-center text-xs ${
            ongletMobile === 'discussion' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-base">💬</span>
          <span>Discussion</span>
        </button>
      </nav>

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
