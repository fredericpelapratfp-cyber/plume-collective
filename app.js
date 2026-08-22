const { useState, useEffect } = React;

function App() {
  const [utilisateurActif] = useState({ id: 1, nom: "Frédéric" });
  
  // Discussion générale
  const [discussionGenerale, setDiscussionGenerale] = useState(() => {
    const sauvegardeG = localStorage.getItem("plume_collective_chat_general");
    if (sauvegardeG) {
      try { return JSON.parse(sauvegardeG); } catch (e) {}
    }
    return [
      { id: 1, auteur: "Système", texte: "Bienvenue sur le salon général ! Proposez vos idées de livres ici.", date: "10:00" },
      { id: 2, auteur: "Frédéric", texte: "Qui est partant pour écrire un livre de SF ?", date: "10:05" }
    ];
  });

  // Livres et chapitres
  const [livres, setLivres] = useState(() => {
    const sauvegarde = localStorage.getItem("plume_collective_livres");
    if (sauvegarde) {
      try { return JSON.parse(sauvegarde); } catch (e) {}
    }
    return [
      {
        id: 1,
        titre: "L'Ombre du Temps",
        synopsis: "Un roman collaboratif captivant à travers les époques.",
        createur: "Frédéric",
        coAuteurs: [],
        statut: "en_cours",
        chapitres: [
          {
            id: 101,
            titre: "Chapitre 1 : Le Début",
            lignes: [
              { id: 1001, auteur: "Frédéric", texte: "La nuit tombait doucement sur la ville..." }
            ]
          }
        ],
        discussionInterne: [
          { id: 1, auteur: "Frédéric", texte: "Bienvenue sur le projet !", date: "14:30" }
        ]
      }
    ];
  });

  const [livreSelectionneId, setLivreSelectionneId] = useState(null);
  const [chapitreSelectionneId, setChapitreSelectionneId] = useState(null);
  const [ongletMobile, setOngletMobile] = useState("bibliotheque");

  const [nouveauTitreLivre, setNouveauTitreLivre] = useState("");
  const [nouveauSynopsisLivre, setNouveauSynopsisLivre] = useState("");
  const [afficherFormLivre, setAfficherFormLivre] = useState(false);
  
  const [nouveauTitreChapitre, setNouveauTitreChapitre] = useState("");
  const [nouvelleLigneTexte, setNouvelleLigneTexte] = useState("");
  const [nouveauMessageDiscussion, setNouveauMessageDiscussion] = useState("");

  // Sauvegardes LocalStorage
  useEffect(() => {
    localStorage.setItem("plume_collective_livres", JSON.stringify(livres));
  }, [livres]);

  useEffect(() => {
    localStorage.setItem("plume_collective_chat_general", JSON.stringify(discussionGenerale));
  }, [discussionGenerale]);

  // Ajustement chapitre actif
  useEffect(() => {
    const livreActif = livres.find(l => l.id === livreSelectionneId);
    if (livreActif && livreActif.chapitres && livreActif.chapitres.length > 0) {
      if (!chapitreSelectionneId || !livreActif.chapitres.some(c => c.id === chapitreSelectionneId)) {
        setChapitreSelectionneId(livreActif.chapitres[0].id);
      }
    } else {
      setChapitreSelectionneId(null);
    }
  }, [livreSelectionneId, livres]);

  // Éléments actifs
  const livreActif = livres.find(l => l.id === livreSelectionneId);
  const chapitreActif = livreActif?.chapitres?.find(c => c.id === chapitreSelectionneId);
  const estLivreTermine = livreActif?.statut === 'termine';

  // --- ACTIONS ---
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

    setLivres([...livres, nouveauLivre]);
    setLivreSelectionneId(nouveauLivreId);
    setChapitreSelectionneId(premierChapitreId);
    setNouveauTitreLivre("");
    setNouveauSynopsisLivre("");
    setAfficherFormLivre(false);
    setOngletMobile("redaction");
  };

  const basculerStatutLivre = (livreId, e) => {
    e.stopPropagation();
    setLivres(livres.map(l => l.id === livreId ? { ...l, statut: l.statut === 'termine' ? 'en_cours' : 'termine' } : l));
  };

  const supprimerLivre = (livre, e) => {
    e.stopPropagation();
    if (window.confirm(`Voulez-vous vraiment supprimer le livre "${livre.titre}" ?`)) {
      const nouveauxLivres = livres.filter(l => l.id !== livre.id);
      setLivres(nouveauxLivres);
      if (livreSelectionneId === livre.id) {
        setLivreSelectionneId(null);
      }
    }
  };

  const exporterEnWord = (livre, e) => {
    e.stopPropagation();
    if (!livre) return;
    let chapitresHTML = "";
    (livre.chapitres || []).forEach(chapitre => {
      chapitresHTML += `<h2>${chapitre.titre}</h2>`;
      (chapitre.lignes || []).forEach(ligne => {
        chapitresHTML += `<p>${ligne.texte}</p>`;
      });
    });
    const contenuHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${livre.titre}</title><style>body { font-family: "Calibri", serif; line-height: 1.6; margin: 40px; } h1 { text-align: center; font-size: 28pt; } .auteur { text-align: center; font-style: italic; margin-bottom: 20pt; } .synopsis { background: #f8fafc; padding: 15px; border-left: 4px solid #f59e0b; margin-bottom: 40pt; } h2 { font-size: 20pt; border-bottom: 1px solid #cbd5e1; margin-top: 30pt; } p { font-size: 12pt; text-indent: 20pt; text-align: justify; }</style></head><body><h1>${livre.titre}</h1><div class="auteur">Auteur : ${livre.createur}</div><div class="synopsis"><strong>Synopsis :</strong><br>${livre.synopsis}</div><hr>${chapitresHTML}</body></html>`;
    try {
      const blob = new Blob(['\ufeff' + contenuHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = livre.titre.toLowerCase().replace(/[^a-z0-9]/gi, '_') + '.doc';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error("Erreur d'exportation :", err); }
  };

  const ajouterChapitre = (e) => {
    e.preventDefault();
    if (!nouveauTitreChapitre.trim() || !livreActif || estLivreTermine) return;
    const nouveauChapitre = { id: Date.now(), titre: nouveauTitreChapitre.trim(), lignes: [] };
    setLivres(livres.map(l => l.id === livreActif.id ? { ...l, chapitres: [...(l.chapitres || []), nouveauChapitre] } : l));
    setChapitreSelectionneId(nouveauChapitre.id);
    setNouveauTitreChapitre("");
  };

  const ajouterLigne = (e) => {
    e.preventDefault();
    if (!nouvelleLigneTexte.trim() || !livreActif || !chapitreActif || estLivreTermine) return;
    const nouvelleLigne = { id: Date.now(), auteur: utilisateurActif.nom, texte: nouvelleLigneTexte.trim() };
    setLivres(livres.map(l => {
      if (l.id !== livreActif.id) return l;
      const chapitresMisAJour = l.chapitres.map(c => c.id === chapitreActif.id ? { ...c, lignes: [...(c.lignes || []), nouvelleLigne] } : c);
      return { ...l, chapitres: chapitresMisAJour };
    }));
    setNouvelleLigneTexte("");
  };

  const ajouterMessageDiscussion = (e) => {
    e.preventDefault();
    if (!nouveauMessageDiscussion.trim()) return;

    const nouveauMessage = {
      id: Date.now(),
      auteur: utilisateurActif.nom,
      texte: nouveauMessageDiscussion.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (livreActif) {
      setLivres(livres.map(l => l.id === livreActif.id ? { ...l, discussionInterne: [...(l.discussionInterne || []), nouveauMessage] } : l));
    } else {
      setDiscussionGenerale([...discussionGenerale, nouveauMessage]);
    }

    setNouveauMessageDiscussion("");
  };

  return (
  <div className="flex flex-col h-screen pb-16 md:pb-0 overflow-hidden">
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

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* BARRE LATÉRALE */}
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

          <div className="p-2 border-b border-slate-800">
            <button
              onClick={() => {
                setLivreSelectionneId(null);
                setOngletMobile("discussion");
              }}
              className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                livreSelectionneId === null
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>🌐</span>
                <span>Salon Général & Idées</span>
              </span>
              <span className="bg-slate-900/40 px-2 py-0.5 rounded text-[10px]">Chat Global</span>
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
                    setOngletMobile("redaction");
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition flex flex-col justify-between ${
                    estSelectionne ? "bg-indigo-800 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm leading-snug">{livre.titre}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        livre.statut === 'termine' ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-amber-900 text-amber-300 border border-amber-700'
                      }`}>
                        {livre.statut === 'termine' ? '🔒 Terminé' : '✏️ En cours'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{livre.synopsis}</p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between items-center text-xs">
                    <span>✍️ {livre.createur}</span>
                    <div className="flex space-x-1">
                      <button 
                        onClick={(e) => basculerStatutLivre(livre.id, e)} 
                        title={livre.statut === 'termine' ? "Rouvrir le livre" : "Marquer comme terminé"} 
                        className="p-1 hover:bg-slate-600 rounded"
                      >
                        {livre.statut === 'termine' ? '🔓' : '✅'}
                      </button>
                      <button onClick={(e) => exporterEnWord(livre, e)} title="Exporter Word" className="p-1 hover:bg-slate-600 rounded text-amber-400">
                        📄
                      </button>
                      <button onClick={(e) => supprimerLivre(livre, e)} title="Supprimer" className="p-1 hover:bg-red-800 rounded text-red-400">
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
        <main className={`flex-1 flex-col bg-amber-50/30 overflow-hidden w-full ${
          ongletMobile === 'redaction' ? 'flex' : 'hidden md:flex'
        }`}>
          {livreActif ? (
            <div className="flex-1 flex flex-col overflow-hidden">
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

                {/* Formulaire nouveau chapitre masque si le livre est termine */}
                {!estLivreTermine && (
                  <form onSubmit={ajouterChapitre} className="flex items-center space-x-1 ml-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Nouveau chap..."
                      value={nouveauTitreChapitre}
                      onChange={(e) => setNouveauTitreChapitre(e.target.value)}
                      className="w-24 sm:w-32 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-indigo-500"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-2 py-1 rounded text-xs">+</button>
                  </form>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
                <div className="bg-white rounded-xl shadow-md border border-slate-200/80 p-4 md:p-8 min-h-full flex flex-col justify-between">
                  <div>
                    <div className="border-b border-slate-200 pb-3 mb-4">
                      <div className="flex justify-between items-start">
                        <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">{livreActif.titre}</h1>
                        {estLivreTermine && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-sans font-semibold border border-emerald-300 shrink-0 ml-2">
                            🔒 Livre Terminé
                          </span>
                        )}
                      </div>
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
                              Ce chapitre est encore vide.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic text-sm">Veuillez sélectionner ou créer un chapitre.</p>
                    )}
                  </div>

                  {/* FORMULAIRE DE RÉDACTION OU MESSAGE DE VERROUILLAGE */}
                  {chapitreActif && (
                    !estLivreTermine ? (
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
                          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-sans px-4 py-2 rounded-lg font-medium shadow transition text-sm">
                            Publier
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-6 p-3 bg-slate-100 border border-slate-300 rounded-lg text-center text-xs text-slate-600 font-sans flex items-center justify-center space-x-2">
                        <span>🔒</span>
                        <span>Ce livre est marqué comme <strong>terminé</strong>. Clique sur l'icône 🔓 dans la liste à gauche si tu souhaites à nouveau éditer le texte.</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
                <span className="text-4xl mb-3 block">🌐</span>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Salon Général & Idées</h2>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Sélectionnez un livre dans le menu de gauche pour commencer à rédiger, ou utilisez le panneau de discussion à droite pour proposer de nouveaux projets littéraires !
                </p>
                <button
                  onClick={() => setAfficherFormLivre(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow hover:bg-indigo-500 transition"
                >
                  + Lancer un nouveau livre
                </button>
              </div>
            </div>
          )}
        </main>

        {/* PANNEAU DE DISCUSSION */}
        <aside className={`w-full md:w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 ${
          ongletMobile === 'discussion' ? 'flex' : 'hidden md:flex'
        }`}>
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-sm flex items-center space-x-2">
              <span>💬</span>
              <span>{livreActif ? `Discussion : ${livreActif.titre}` : "Salon Général (Global)"}</span>
            </h3>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {livreActif ? (
                livreActif.discussionInterne?.length > 0 ? (
                  livreActif.discussionInterne.map(msg => (
                    <div key={msg.id} className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg text-xs">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-indigo-900">{msg.auteur}</span>
                        <span className="text-slate-400 text-[9px]">{msg.date}</span>
                      </div>
                      <p className="text-slate-700">{msg.texte}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center mt-4">
                    Aucune note d'équipe pour ce livre.
                  </p>
                )
              ) : (
                discussionGenerale.length > 0 ? (
                  discussionGenerale.map(msg => (
                    <div key={msg.id} className="bg-amber-50 border border-amber-100 p-2 rounded-lg text-xs">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-semibold text-amber-900">{msg.auteur}</span>
                        <span className="text-slate-400 text-[9px]">{msg.date}</span>
                      </div>
                      <p className="text-slate-700">{msg.texte}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center mt-4">
                    Le salon général est vide.
                  </p>
                )
              )}
            </div>

            <form onSubmit={ajouterMessageDiscussion} className="p-2 border-t border-slate-200 flex space-x-1.5 bg-white">
              <input
                type="text"
                placeholder={livreActif ? "Parler de ce livre..." : "Proposer une idée générale..."}
                value={nouveauMessageDiscussion}
                onChange={(e) => setNouveauMessageDiscussion(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs transition">
                Envoi
              </button>
            </form>
          </div>
        </aside>

      </div>

            {/* NAVIGATION MOBILE FIXÉE EN BAS */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-2 z-50 h-16">
        <button
          onClick={() => setOngletMobile('bibliotheque')}
          className={`flex flex-col items-center justify-center w-full text-xs ${
            ongletMobile === 'bibliotheque' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">📚</span>
          <span className="text-[10px]">Livres</span>
        </button>
        <button
          onClick={() => setOngletMobile('redaction')}
          className={`flex flex-col items-center justify-center w-full text-xs ${
            ongletMobile === 'redaction' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">✍️</span>
          <span className="text-[10px]">Rédaction</span>
        </button>
        <button
          onClick={() => setOngletMobile('discussion')}
          className={`flex flex-col items-center justify-center w-full text-xs ${
            ongletMobile === 'discussion' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-lg">💬</span>
          <span className="text-[10px]">Discussion</span>
        </button>
      </nav>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
