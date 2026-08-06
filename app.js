import React from 'react'
import ReactDOM from 'react-dom'

export default function App() {
  // --- ÉTAT 1 : Sécurité, Comptes & Login ---
  const [estConnecte, setEstConnecte] = React.useState(false)
  const [loginSaisi, setLoginSaisi] = React.useState('')
  const [motDePassaSaisir, setMotDePassaSaisir] = React.useState('')
  const [erreurMdp, setErreurMdp] = React.useState(false)
  const [utilisateurActif, setUtilisateurActif] = React.useState(null)

  const COMPTES_AUTEURS = [
    { login: "frederic", mdp: "lille2026", nom: "Frédéric" },
    { login: "amine", mdp: "spck2026", nom: "Amine" },
    { login: "isaac", mdp: "robot2026", nom: "Isaac" }
  ]

  // --- ÉTAT 2 : Chat Général (Bibliothèque) ---
  const [salonGeneral, setSalonGeneral] = React.useState([
    { id: 1, auteur: "Amine", texte: "Des partants pour lancer une histoire ce soir ?", heure: "14:32" },
    { id: 2, auteur: "Frédéric", texte: "Carrément ! J'ai une idée de polar sur la région.", heure: "14:35" }
  ])
  const [nouveauMessageGeneral, setNouveauMessageGeneral] = React.useState('')

  // --- ÉTAT 3 : La Bibliothèque & Livres ---
  const [livres, setLivres] = React.useState([
    {
      id: "livre-1",
      titre: "Les Mystères de Tourcoing",
      statut: "en_cours",
      typeAcces: "ouvert",
      initiateur: "Frédéric",
      auteursAutorises: ["Frédéric", "Amine", "Isaac"], 
      chapitres: [
        {
          id: "ch-1",
          titre: "Prologue : La brume",
          lignes: [
            { id: 101, auteur: "Frédéric", texte: "La brume se levait doucement sur la Grand Place ce matin-là.", commentaires: [], image: "" }
          ]
        }
      ],
      discussionInterne: [
        { id: 1, auteur: "Frédéric", texte: "Bienvenue sur le fil de ce livre ! Des idées pour le chapitre deux ?", heure: "09:15" }
      ]
    }
  ])

  // --- ÉTAT 4 : Formulaire de création de livre ---
  const [nouveauTitreLivre, setNouveauTitreLivre] = React.useState('')
  const [typeAccesSelectionne, setTypeAccesSelectionne] = React.useState('ouvert')
  const [auteursCoches, setAuteursCoches] = React.useState([])

  // --- ÉTAT 5 : Atelier, Chapitres & Navigation ---
  const [livreSelectionneId, setLivreSelectionneId] = React.useState(null)
  const [chapitreSelectionneId, setChapitreSelectionneId] = React.useState(null) 
  const [ligneSelectionneeId, setLigneSelectionneeId] = React.useState(null) 
  
  const [nouveauTitreChapitre, setNouveauTitreChapitre] = React.useState('')
  const [nouveauTexteLigne, setNouveauTexteLigne] = React.useState('')
  
  const [texteCommentaire, setTexteCommentaire] = React.useState('')
  const [texteEnCoursDEdition, setTexteEnCoursDEdition] = React.useState('')
  const [urlImageEnCours, setUrlImageEnCours] = React.useState('')
  const [erreurEdition, setErreurEdition] = React.useState('')
  
  const [ongletActif, setOngletActif] = React.useState('relecture')
  const [nouveauMessageInterne, setNouveauMessageInterne] = React.useState('')
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [titreEnCoursEdition, setTitreEnCoursEdition] = React.useState('')

  // Sélections actives complexes
  const livreActif = livres.find(l => l.id === livreSelectionneId)
  
  const chapitreActif = livreActif && livreActif.chapitres 
    ? (livreActif.chapitres.find(c => c.id === chapitreSelectionneId) || livreActif.chapitres[0])
    : null

  const ligneActive = chapitreActif && chapitreActif.lignes 
    ? chapitreActif.lignes.find(l => l.id === ligneSelectionneeId)
    : null

  // Ajustement automatique du chapitre actif
  React.useEffect(() => {
    if (livreActif && livreActif.chapitres.length > 0) {
      setChapitreSelectionneId(livreActif.chapitres[0].id)
      setLigneSelectionneeId(null)
    } else {
      setChapitreSelectionneId(null)
      setLigneSelectionneeId(null)
    }
  }, [livreSelectionneId])

  const obtenirHeureCourante = () => {
    const maintenant = new Date()
    return maintenant.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // --- ACTIONS CHAT ---
  const envoyerMessageGeneral = (e) => {
    e.preventDefault()
    if (!nouveauMessageGeneral.trim()) return
    const msg = {
      id: Date.now(),
      auteur: utilisateurActif.nom,
      texte: nouveauMessageGeneral,
      heure: obtenirHeureCourante()
    }
    setSalonGeneral([...salonGeneral, msg])
    setNouveauMessageGeneral('')
  }

  const envoyerMessageInterne = (e) => {
    e.preventDefault()
    if (!nouveauMessageInterne.trim() || livreActif.statut !== "en_cours") return
    const msg = {
      id: Date.now(),
      auteur: utilisateurActif.nom,
      texte: nouveauMessageInterne,
      heure: obtenirHeureCourante()
    }
    setLivres(livres.map(livre => {
      if (livre.id === livreSelectionneId) {
        return { ...livre, discussionInterne: [...livre.discussionInterne, msg] }
      }
      return livre
    }))
    setNouveauMessageInterne('')
  }

  // --- GESTION LIVRES ---
  const gererToggleAuteurComite = (nomAuteur) => {
    if (auteursCoches.includes(nomAuteur)) {
      setAuteursCoches(auteursCoches.filter(a => a !== nomAuteur))
    } else {
      setAuteursCoches([...auteursCoches, nomAuteur])
    }
  }

  const creerNouveauLivre = (e) => {
    e.preventDefault()
    if (!nouveauTitreLivre.trim()) return

    const listeAuteurs = typeAccesSelectionne === 'ouvert' 
      ? COMPTES_AUTEURS.map(a => a.nom)
      : Array.from(new Set([utilisateurActif.nom, ...auteursCoches]))

    const nouveauLivre = {
      id: `livre-${Date.now()}`,
      titre: nouveauTitreLivre,
      statut: "en_cours",
      typeAcces: typeAccesSelectionne,
      initiateur: utilisateurActif.nom,
      auteursAutorises: listeAuteurs,
      chapitres: [
        { id: `ch-${Date.now()}`, titre: "Chapitre 1", lignes: [] }
      ],
      discussionInterne: [{ id: Date.now(), auteur: "Système", texte: `Histoire initialisée par ${utilisateurActif.nom}.`, heure: obtenirHeureCourante() }]
    }

    setLivres([nouveauLivre, ...livres])
    setNouveauTitreLivre('')
    setTypeAccesSelectionne('ouvert')
    setAuteursCoches([])
    alert(`Le projet « ${nouveauLivre.titre} » a été initialisé !`)
  }

  const sauvegarderTitreLivre = (e) => {
    e.preventDefault()
    if (!titreEnCoursEdition.trim()) return

    setLivres(livres.map(livre => {
      if (livre.id === livreSelectionneId) {
        return { ...livre, titre: titreEnCoursEdition.trim() }
      }
      return livre
    }))
    setIsEditingTitle(false)
  }

  // --- GESTION DES CHAPITRES ---
  const ajouterNouveauChapitre = (e) => {
    e.preventDefault()
    if (!nouveauTitreChapitre.trim() || livreActif.statut !== "en_cours") return

    const nouveauCh = {
      id: `ch-${Date.now()}`,
      titre: nouveauTitreChapitre.trim(),
      lignes: []
    }

    setLivres(livres.map(livre => {
      if (livre.id === livreSelectionneId) {
        return { ...livre, chapitres: [...livre.chapitres, nouveauCh] }
      }
      return livre
    }))
    setChapitreSelectionneId(nouveauCh.id)
    setNouveauTitreChapitre('')
  }

  const verifierCode = (e) => {
    e.preventDefault()
    const compteTrouve = COMPTES_AUTEURS.find(
      u => u.login.toLowerCase() === loginSaisi.trim().toLowerCase() && u.mdp === motDePassaSaisir
    )
    if (compteTrouve) {
      setEstConnecte(true)
      setUtilisateurActif(compteTrouve)
      setErreurMdp(false)
    } else {
      setErreurMdp(true)
    }
  }

  const seDeconnecter = () => {
    setEstConnecte(false)
    setUtilisateurActif(null)
    setLoginSaisi('')
    setMotDePassaSaisir('')
    setLivreSelectionneId(null)
    setChapitreSelectionneId(null)
    setLigneSelectionneeId(null)
    setIsEditingTitle(false)
  }

  const selectionnerLigne = (id) => {
    setLigneSelectionneeId(id)
    setOngletActif('relecture')
    if (chapitreActif) {
      const lg = chapitreActif.lignes.find(l => l.id === id)
      setTexteEnCoursDEdition(lg ? lg.texte : '')
      setUrlImageEnCours(lg && lg.image ? lg.image : '')
    }
    setErreurEdition('')
  }

  const ajouterAuManuscrit = (e) => {
    e.preventDefault()
    if (!nouveauTexteLigne.trim() || !chapitreSelectionneId || livreActif.statut !== "en_cours") return

    const nouvelleLigne = {
      id: Date.now(),
      auteur: utilisateurActif.nom,
      texte: nouveauTexteLigne.trim(),
      commentaires: [],
      image: ""
    }

    setLivres(livres.map(livre => {
      if (livre.id === livreSelectionneId) {
        const chapitresMisAJour = livre.chapitres.map(ch => {
          if (ch.id === chapitreSelectionneId) {
            return { ...ch, lignes: [...ch.lignes, nouvelleLigne] }
          }
          return ch
        })
        return { ...livre, chapitres: chapitresMisAJour }
      }
      return livre
    }))
    setNouveauTexteLigne('')
  }

  const sauvegarderModification = (e) => {
    e.preventDefault()
    if (!ligneActive || livreActif.statut !== "en_cours") return
    if (utilisateurActif.nom.toLowerCase() !== ligneActive.auteur.toLowerCase()) {
      setErreurEdition("Seul l'auteur d'origine de ce paragraphe peut le modifier.")
      return
    }
    if (!texteEnCoursDEdition.trim()) return

    setLivres(livres.map(livre => {
      if (livre.id === livreSelectionneId) {
        const chapitresMisAJour = livre.chapitres.map(ch => {
          if (ch.id === chapitreSelectionneId) {
            const lignesMisAJour = ch.lignes.map(l => {
              if (l.id === ligneSelectionneeId) {
                return { ...l, texte: texteEnCoursDEdition, image: urlImageEnCours.trim() }
              }
              return l
            })
            return { ...ch, lignes: lignesMisAJour }
          }
          return ch
        })
        return { ...livre, chapitres: chapitresMisAJour }
      }
      return livre
    }))
    setErreurEdition('')
    alert("Texte et illustrations mis à jour !")
  }

  const ajouterCommentaire = (e) => {
    e.preventDefault()
    if (!texteCommentaire.trim() || livreActif.statut !== "en_cours") return

    const nouveauCom = {
      id: Date.now(),
      auteur: utilisateurActif.nom,
      texte: texteCommentaire.trim()
    }

    setLivres(livres.map(livre => {
      if (livre.id === livreSelectionneId) {
        const chapitresMisAJour = livre.chapitres.map(ch => {
          if (ch.id === chapitreSelectionneId) {
            const lignesMisAJour = ch.lignes.map(l => {
              if (l.id === ligneSelectionneeId) {
                return { ...l, commentaires: [...l.commentaires, nouveauCom] }
              }
              return l
            })
            return { ...ch, lignes: lignesMisAJour }
          }
          return ch
        })
        return { ...livre, chapitres: chapitresMisAJour }
      }
      return livre
    }))
    setTexteCommentaire('')
  }

  const resoudreCommentaire = (comId) => {
    if (livreActif.statut !== "en_cours") return
    setLivres(livres.map(livre => {
      if (livre.id === livreSelectionneId) {
        const chapitresMisAJour = livre.chapitres.map(ch => {
          if (ch.id === chapitreSelectionneId) {
            const lignesMisAJour = ch.lignes.map(l => {
              if (l.id === ligneSelectionneeId) {
                return { ...l, commentaires: l.commentaires.filter(c => c.id !== comId) }
              }
              return l
            })
            return { ...ch, lignes: lignesMisAJour }
          }
          return ch
        })
        return { ...livre, chapitres: chapitresMisAJour }
      }
      return livre
    }))
  }

  const cloturerHistoire = () => {
    if (window.confirm("Êtes-vous sûr de vouloir clore définitivement ce récit ?")) {
      setLivres(livres.map(livre => {
        if (livre.id === livreSelectionneId) {
          return { ...livre, statut: "fini" }
        }
        return livre
      }))
      setLigneSelectionneeId(null)
    }
  }

  // --- ÉCRAN 1 : LE LOGIN ---
  if (!estConnecte) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 font-sans selection:bg-amber-500/30">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 text-center">
          <div className="inline-block bg-amber-500/10 text-amber-500 text-2xl p-3 rounded-xl mb-4">✍️</div>
          <h1 className="text-3xl font-serif font-bold text-slate-100 mb-2 tracking-tight">Plume Collective</h1>
          <p className="text-slate-400 text-sm mb-6">Espace d'écriture privé et restreint</p>
          <form onSubmit={verifierCode} className="space-y-4">
            <input 
              type="text" value={loginSaisi} onChange={(e) => setLoginSaisi(e.target.value)}
              placeholder="Identifiant"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-sans text-center focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-600"
            />
            <input 
              type="password" value={motDePassaSaisir} onChange={(e) => setMotDePassaSaisir(e.target.value)}
              placeholder="Mot de passe"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-sans text-center focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-600"
            />
            {erreurMdp && <p className="text-rose-400 text-xs mt-2 font-medium">Identifiant ou mot de passe incorrect.</p>}
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold py-3 rounded-xl font-sans cursor-pointer shadow-lg shadow-amber-950/20 transition-all mt-2">
              Rejoindre l'atelier
            </button>
          </form>
        </div>
      </div>
    )
  }

  const livresVisibles = livres.filter(livre => 
    livre.typeAcces === 'ouvert' || livre.auteursAutorises.includes(utilisateurActif.nom)
  )

  // --- ÉCRAN 2 : LA BIBLIOTHÈQUE ---
  if (!livreSelectionneId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500/30">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-12 border-b border-slate-900 pb-6">
            <div className="text-left">
              <h1 className="text-4xl font-serif font-bold text-slate-100 tracking-tight">Plume Collective</h1>
              <p className="text-slate-400 text-sm mt-1">Auteur actif : <span className="text-amber-500 font-semibold">{utilisateurActif.nom}</span></p>
            </div>
            <button onClick={seDeconnecter} className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium py-2 px-4 rounded-xl border border-slate-800 transition-all cursor-pointer">
              Déconnexion ✕
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* PANNEAU DE CHAT GÉNÉRAL */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-850 shadow-xl flex flex-col h-[520px]">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-3 mb-4 flex items-center gap-2">💬 Salon Général</h2>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left mb-4 custom-scrollbar">
                {salonGeneral.map(msg => (
                  <div key={msg.id} className="text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-bold text-amber-500/90">{msg.auteur}</span>
                      <span>{msg.heure}</span>
                    </div>
                    <p className="text-slate-300 break-words leading-relaxed">{msg.texte}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={envoyerMessageGeneral} className="flex gap-2 pt-3 border-t border-slate-850">
                <input 
                  type="text" value={nouveauMessageGeneral} onChange={(e) => setNouveauMessageGeneral(e.target.value)}
                  placeholder="Un mot au salon..."
                  className="flex-1 text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg outline-none focus:border-amber-500 text-slate-200"
                />
                <button type="submit" className="bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white text-xs px-3.5 rounded-lg font-medium transition-all cursor-pointer">
                  →
                </button>
              </form>
            </div>

            {/* ATELIERS & LIVRES */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-slate-200 flex items-center gap-2 pb-1 text-left">🚀 Histoires en cours</h2>
                {livresVisibles.filter(l => l.statut === "en_cours").length > 0 ? (
                  livresVisibles.filter(l => l.statut === "en_cours").map(livre => (
                    <div key={livre.id} className="bg-slate-900 p-6 rounded-2xl border border-slate-850 shadow-md hover:border-amber-500/40 transition-all flex justify-between items-center group">
                      <div className="text-left pr-4">
                        <h3 className="text-lg font-bold text-slate-100 font-serif group-hover:text-amber-500 transition-colors">{livre.titre}</h3>
                        <p className="text-xs text-slate-400 mt-2">
                          {livre.chapitres ? livre.chapitres.length : 0} chapitres • Par {livre.initiateur} • 
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${livre.typeAcces === 'ouvert' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            {livre.typeAcces === 'ouvert' ? '🌍 Ouvert' : '🔒 Restreint'}
                          </span>
                        </p>
                      </div>
                      <button onClick={() => setLivreSelectionneId(livre.id)} className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all shrink-0 cursor-pointer">
                        Écrire →
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic text-left py-4">Aucun atelier actif accessible.</p>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-slate-200 flex items-center gap-2 pb-1 text-left">📚 Œuvres terminées</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {livresVisibles.filter(l => l.statut === "fini").length > 0 ? (
                    livresVisibles.filter(l => l.statut === "fini").map(livre => (
                      <div key={livre.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-900 shadow-sm text-left flex flex-col justify-between">
                        <div>
                          <h3 className="text-md font-bold text-slate-300 font-serif">{livre.titre}</h3>
                          <p className="text-[11px] text-slate-500 mt-2">{livre.chapitres ? livre.chapitres.length : 0} chapitres • Clos</p>
                        </div>
                        <button onClick={() => setLivreSelectionneId(livre.id)} className="mt-5 text-xs font-semibold text-amber-500/80 hover:text-amber-400 flex items-center gap-1 transition-all cursor-pointer">
                          Lire le livre 📖
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic text-left py-2 col-span-2">Aucun livre terminé.</p>
                  )}
                </div>
              </div>
            </div>

            {/* CRÉATION LIVRE */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-850 shadow-xl space-y-5 text-left">
              <h2 className="text-lg font-serif font-bold text-slate-100 border-b border-slate-850 pb-3">🎨 Lancer une histoire</h2>
              <form onSubmit={creerNouveauLivre} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Titre du manuscrit</label>
                  <input 
                    type="text" required value={nouveauTitreLivre} onChange={(e) => setNouveauTitreLivre(e.target.value)}
                    placeholder="Ex: Le Secret de la Citadelle"
                    className="w-full text-sm px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500 text-slate-200 placeholder:text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Confidentialité</label>
                  <select 
                    value={typeAccesSelectionne} onChange={(e) => setTypeAccesSelectionne(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500 text-slate-300"
                  >
                    <option value="ouvert">🌍 Ouvert à tous</option>
                    <option value="comite_restreint">🔒 Comité restreint</option>
                  </select>
                </div>

                {typeAccesSelectionne === 'comite_restreint' && (
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Co-auteurs à inviter :</p>
                    {COMPTES_AUTEURS.filter(a => a.nom !== utilisateurActif.nom).map(auteur => (
                      <label key={auteur.login} className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer select-none hover:text-slate-100">
                        <input 
                          type="checkbox" checked={auteursCoches.includes(auteur.nom)}
                          onChange={() => gererToggleAuteurComite(auteur.nom)}
                          className="rounded border-slate-800 bg-slate-900 text-amber-500 focus:ring-0 w-4 h-4"
                        />
                        {auteur.nom}
                      </label>
                    ))}
                  </div>
                )}
                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-100 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-slate-700/60 shadow-md">
                  Initialiser le projet
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    )
  }

  // --- ÉCRAN 3 : L'ATELIER D'ÉCRITURE ---
  const estLEntreeInitiateur = livreActif.initiateur === utilisateurActif.nom
  const estAuteurAutorise = livreActif.auteursAutorises.includes(utilisateurActif.nom)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SECTION MANUSCRIT (GAUCHE - PRND 3/4 DE L'ESPACE POUR LE CONFORT) */}
        <div className="lg:col-span-3 space-y-6 text-left">
          <button 
            onClick={() => { setLivreSelectionneId(null); setChapitreSelectionneId(null); setLigneSelectionneeId(null); }}
            className="text-xs font-semibold text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            ← Bibliothèque
          </button>

          <header className="flex justify-between items-start gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-850 shadow-md">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md font-bold ${livreActif.statut === 'en_cours' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                  {livreActif.statut === 'en_cours' ? 'En cours' : 'Terminé'}
                </span>
                <span className="text-xs text-slate-400">
                  Projet initié par <strong className="text-slate-200">{livreActif.initiateur}</strong>
                </span>
              </div>

              {isEditingTitle ? (
                <form onSubmit={sauvegarderTitreLivre} className="flex gap-2 mt-3 max-w-xl">
                  <input
                    type="text" value={titreEnCoursEdition} onChange={(e) => setTitreEnCoursEdition(e.target.value)}
                    className="flex-1 text-2xl font-serif font-bold px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500 text-slate-100"
                    autoFocus
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 rounded-xl font-semibold cursor-pointer">Sauver</button>
                  <button type="button" onClick={() => setIsEditingTitle(false)} className="bg-slate-800 text-slate-300 text-xs px-3 rounded-xl cursor-pointer">Annuler</button>
                </form>
              ) : (
                <div className="flex items-center gap-4 mt-2">
                  <h1 className="text-3xl font-serif font-bold text-slate-100 tracking-tight">{livreActif.titre}</h1>
                  {livreActif.statut === "en_cours" && estAuteurAutorise && (
                    <button onClick={() => { setIsEditingTitle(true); setTitreEnCoursEdition(livreActif.titre); }} className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-400 py-1 px-2.5 rounded-lg border border-slate-850 transition-colors cursor-pointer">
                      Modifier
                    </button>
                  )}
                </div>
              )}
            </div>
            {livreActif.statut === "en_cours" && estLEntreeInitiateur && (
              <button onClick={cloturerHistoire} className="bg-rose-950/40 hover:bg-rose-900/40 text-rose-400 border border-rose-900/50 text-xs font-semibold py-2 px-3.5 rounded-xl transition-colors cursor-pointer shrink-0">
                🔒 Clore le récit
              </button>
            )}
          </header>

          {/* SÉLECTEUR DE CHAPITRES ET AJOUT */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chapitre :</label>
              <select 
                value={chapitreSelectionneId || ''} 
                onChange={(e) => { setChapitreSelectionneId(e.target.value); setLigneSelectionneeId(null); }}
                className="text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-amber-500"
              >
                {livreActif.chapitres && livreActif.chapitres.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.titre}</option>
                ))}
              </select>
            </div>

            {livreActif.statut === "en_cours" && estAuteurAutorise && (
              <form onSubmit={ajouterNouveauChapitre} className="flex gap-2">
                <input 
                  type="text" required value={nouveauTitreChapitre} onChange={(e) => setNouveauTitreChapitre(e.target.value)}
                  placeholder="Numéro ou sous-titre..."
                  className="text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl outline-none text-slate-200 placeholder:text-slate-700"
                />
                <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 rounded-xl font-medium transition-colors cursor-pointer">
                  + Nouveau chapitre
                </button>
              </form>
            )}
          </div>

          {/* LE TEXTE DU CHAPITRE SÉLECTIONNÉ */}
          <section className="bg-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-850 font-serif">
            <h2 className="text-xl font-bold text-amber-500 mb-6 border-b border-slate-850 pb-3">
              {chapitreActif ? chapitreActif.titre : "Sélectionnez ou créez un chapitre"}
            </h2>
            <div className="text-slate-300 text-lg sm:text-xl leading-relaxed text-justify space-y-6">
              {chapitreActif && chapitreActif.lignes && chapitreActif.lignes.length > 0 ? (
                chapitreActif.lignes.map((ligne) => {
                  const aDesCommentaires = ligne.commentaires.length > 0
                  const estSelectionne = ligne.id === ligneSelectionneeId

                  return (
                    <div key={ligne.id} className="space-y-3">
                      {ligne.image && (
                        <div className="w-full max-h-[350px] overflow-hidden rounded-xl border border-slate-850 my-4 shadow-md">
                          <img 
                            src={ligne.image} alt="Illustration" className="w-full h-full object-cover opacity-80"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <p 
                        onClick={() => selectionnerLigne(ligne.id)}
                        className={`inline-block w-full cursor-pointer rounded-xl p-3 transition-all group relative indent-8 font-serif tracking-wide
                          ${aDesCommentaires ? 'bg-amber-950/20 border-l-2 border-amber-500 hover:bg-amber-950/30' : 'hover:bg-slate-850/60'}
                          ${estSelectionne ? 'bg-slate-950 ring-1 ring-amber-500/50 text-slate-100 shadow-inner' : ''}
                        `}
                      >
                        {ligne.texte}
                        <span className="absolute top-2 right-2 hidden group-hover:inline-block bg-slate-950 text-slate-400 text-[9px] font-sans py-0.5 px-2 rounded-md border border-slate-800 shadow-md z-10">
                          Écrit par {ligne.auteur}
                        </span>
                      </p>
                    </div>
                  )
                })
              ) : (
                <p className="text-slate-500 text-sm font-sans italic text-center py-8 indent-0">Ce chapitre est encore vierge de texte.</p>
              )}
            </div>
          </section>

          {livreActif.statut === "en_cours" && chapitreSelectionneId && (
            <section className="bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-850 shadow-md">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans mb-3">✍️ Poursuivre la rédaction</h3>
              <form onSubmit={ajouterAuManuscrit} className="space-y-4">
                <textarea 
                  rows="4" value={nouveauTexteLigne} onChange={(e) => setNouveauTexteLigne(e.target.value)}
                  placeholder="Rédigez le paragraphe suivant ici..." 
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-slate-100 font-serif text-lg leading-relaxed outline-none focus:border-amber-500"
                />
                <div className="flex justify-end">
                  <button type="submit" className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold py-2.5 px-6 rounded-xl font-sans shadow-md cursor-pointer transition-colors">
                    Ajouter au manuscrit
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        {/* DOUBLE PANNEAU INTERACTIF LATÉRAL (DROITE - 1/4 ESPACE) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-slate-900 rounded-2xl border border-slate-850 min-h-[550px] flex flex-col shadow-xl">
            
            <div className="flex border-b border-slate-850 text-[11px] font-sans font-bold uppercase tracking-wider">
              <button onClick={() => setOngletActif('relecture')} className={`flex-1 py-3.5 text-center rounded-tl-2xl border-r border-slate-850 transition-colors ${ongletActif === 'relecture' ? 'bg-slate-950 text-amber-500' : 'text-slate-400 hover:bg-slate-850/40'}`}>
                🔎 Focus
              </button>
              <button onClick={() => setOngletActif('chat')} className={`flex-1 py-3.5 text-center rounded-tr-2xl transition-colors ${ongletActif === 'chat' ? 'bg-slate-950 text-amber-500' : 'text-slate-400 hover:bg-slate-850/40'}`}>
                💬 Loge
              </button>
            </div>

            {/* RELECTURE & MODIFICATION DE LIGNE */}
            {ongletActif === 'relecture' && (
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                {ligneActive ? (
                  <div className="space-y-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">Ajustements</h3>
                        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-850 font-sans">Par {ligneActive.auteur}</span>
                      </div>

                      {livreActif.statut === "en_cours" && (
                        <form onSubmit={sauvegarderModification} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3 mb-4">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase font-sans mb-1">Texte du bloc</label>
                            <textarea 
                              rows="4" value={texteEnCoursDEdition} onChange={(e) => setTexteEnCoursDEdition(e.target.value)}
                              className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-serif text-slate-200 outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase font-sans mb-1">Illustration (Lien URL)</label>
                            <input 
                              type="text" value={urlImageEnCours} onChange={(e) => setUrlImageEnCours(e.target.value)}
                              placeholder="https://lien-image.com/photo.jpg"
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-sans text-slate-300 outline-none focus:border-amber-500 placeholder:text-slate-700"
                            />
                          </div>
                          {erreurEdition && <p className="text-rose-400 text-[10px] font-sans font-medium mt-1">{erreurEdition}</p>}
                          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold py-2 rounded-lg font-sans transition-colors cursor-pointer mt-2 shadow-sm">
                            Enregistrer les changements
                          </button>
                        </form>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans border-b border-slate-850 pb-1.5">Notes de marge</h4>
                      <div className="space-y-2.5 overflow-y-auto max-h-[150px] custom-scrollbar">
                        {ligneActive.commentaires && ligneActive.commentaires.length > 0 ? (
                          ligneActive.commentaires.map(com => (
                            <div key={com.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-xs flex justify-between items-start gap-2 shadow-sm">
                              <div className="flex-1 leading-relaxed">
                                <span className="font-bold text-amber-500/80 font-sans">{com.auteur} : </span>
                                <span className="text-slate-300 font-sans">{com.texte}</span>
                              </div>
                              {livreActif.statut === "en_cours" && (
                                <button onClick={() => resoudreCommentaire(com.id)} className="text-[9px] text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/20 transition-colors shrink-0 font-sans font-medium">✓ Archiver</button>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-xs font-sans italic">Aucune note sur ce paragraphe.</p>
                        )}
                      </div>
                    </div>

                    {livreActif.statut === "en_cours" && (
                      <form onSubmit={ajouterCommentaire} className="border-t border-slate-850 pt-4 space-y-2">
                        <textarea 
                          rows="2" value={texteCommentaire} onChange={(e) => setTexteCommentaire(e.target.value)}
                          placeholder="Une suggestion, une alerte de cohérence ?" 
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs font-sans text-slate-200 outline-none resize-none placeholder:text-slate-600"
                        />
                        <button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded-xl text-xs font-sans cursor-pointer transition-colors">
                          Fixer la note au paragraphe
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 my-auto p-4">
                    <span className="text-2xl mb-2 opacity-40">🔍</span>
                    <p className="font-sans text-xs max-w-[200px] leading-relaxed">Sélectionnez une ligne dans le manuscrit pour la corriger, y lier une illustration ou travailler sa structure.</p>
                  </div>
                )}
              </div>
            )}

            {/* DISCUSSION INTERNE SUR LE SCÉNARIO */}
            {ongletActif === 'chat' && (
              <div className="p-5 flex-1 flex flex-col justify-between h-[460px] text-left">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 custom-scrollbar">
                  {livreActif.discussionInterne && livreActif.discussionInterne.length > 0 ? (
                    livreActif.discussionInterne.map(msg => (
                      <div key={msg.id} className="text-xs bg-slate-950 p-3 rounded-xl border border-slate-850 shadow-sm">
                        <div className="flex justify-between font-sans text-[10px] text-slate-500 mb-1">
                          <span className="font-bold text-amber-500/80">{msg.auteur}</span>
                          <span>{msg.heure}</span>
                        </div>
                        <p className="font-sans text-slate-300 break-words leading-relaxed">{msg.texte}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs font-sans italic text-center pt-10">Fils de discussion vierge. Idéal pour poser la trame ou le plan !</p>
                  )}
                </div>

                {livreActif.statut === "en_cours" ? (
                  <form onSubmit={envoyerMessageInterne} className="flex gap-2 pt-3 border-t border-slate-850">
                    <input 
                      type="text" value={nouveauMessageInterne} onChange={(e) => setNouveauMessageInterne(e.target.value)}
                      placeholder="Discuter de l'intrigue..."
                      className="flex-1 text-xs px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-lg outline-none text-slate-200 focus:border-amber-500"
                    />
                    <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3.5 rounded-lg font-medium transition-colors cursor-pointer">
                      →
                    </button>
                  </form>
                ) : (
                  <p className="text-center text-[11px] text-slate-500 italic pt-3 border-t border-slate-850 font-sans">Le récit est clos, le fil est verrouillé.</p>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
  