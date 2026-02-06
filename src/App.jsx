import React, { useState, useEffect } from 'react';
import './App.css';

// --- CONFIGURATION ---
// PASTE YOUR SHEETDB URL HERE
const API_URL = "https://sheetdb.io/api/v1/YOUR_API_ID_HERE"; 

const MASTER_COMPANIES = [
  { id: 1, name: "Apple", sector: "Technology", trait: "Stable", points: 100 },
  { id: 2, name: "Microsoft", sector: "Technology", trait: "Stable", points: 85 },
  { id: 3, name: "Google", sector: "Technology", trait: "Balanced", points: 70 },
  { id: 4, name: "Infosys", sector: "Technology", trait: "Balanced", points: 70 },
  { id: 5, name: "Paytm", sector: "Technology", trait: "Growth", points: 40 },
  { id: 6, name: "Snowflake", sector: "Technology", trait: "Growth", points: 40 },
  { id: 7, name: "JPMorgan", "sector": "Finance", trait: "Stable", points: 100 },
  { id: 8, name: "HDFC Bank", "sector": "Finance", trait: "Stable", points: 85 },
  { id: 9, name: "Visa", "sector": "Finance", trait: "Balanced", points: 70 },
  { id: 10, name: "Zerodha", "sector": "Finance", trait: "Volatile", points: 40 },
  { id: 11, name: "Reliance", "sector": "Energy", trait: "Balanced", points: 100 },
  { id: 12, name: "ExxonMobil", "sector": "Energy", trait: "Volatile", points: 85 },
  { id: 13, name: "Adani Green", "sector": "Energy", trait: "Growth", points: 40 },
  { id: 14, name: "Tesla", "sector": "Mobility", trait: "Growth", points: 100 },
  { id: 15, name: "Toyota", "sector": "Mobility", trait: "Stable", points: 85 },
  { id: 16, name: "Uber", "sector": "Mobility", trait: "Volatile", points: 40 },
  { id: 17, name: "Tata Steel", "sector": "Manufacturing", trait: "Volatile", points: 100 },
  { id: 18, name: "L&T", "sector": "Manufacturing", trait: "Balanced", points: 85 },
  { id: 19, name: "Disney", "sector": "Media", trait: "Stable", points: 100 },
  { id: 20, name: "Pfizer", "sector": "Healthcare", trait: "Stable", points: 100 }
];

const EVENTS = [
  { name: "Economic Boom", rules: { Manufacturing: 30, Mobility: 25, Technology: 20, Finance: 10 } },
  { name: "Recession", rules: { Manufacturing: -30, Mobility: -25, Technology: -20, Finance: -10 } },
  { name: "Pandemic", rules: { Healthcare: 40, Mobility: -25, Media: -20 } },
  { name: "Tech Breakthrough", rules: { Technology: 25, Finance: 15, Manufacturing: -10 } },
  { name: "Energy Crisis", rules: { Energy: 30, Mobility: -15, Manufacturing: -20 } },
  { name: "Festive Boom", rules: { FMCG: 30, Media: 25, Mobility: 20 } }
];

const CEOS = [
  { name: "Tech Visionary", sector: "Technology", multiplier: 1.3 },
  { name: "Banking Strategist", sector: "Finance", multiplier: 1.4 },
  { name: "Energy Czar", sector: "Energy", multiplier: 1.4 },
  { name: "Mobility Disruptor", sector: "Mobility", multiplier: 1.3 },
  { name: "Iron Man", sector: "Manufacturing", multiplier: 1.3 },
  { name: "Media Mogul", sector: "Media", multiplier: 1.4 }
];

export default function App() {
  const [view, setView] = useState('SETUP');
  const [loading, setLoading] = useState(false);
  
  // SETUP STATE
  const [teamCount, setTeamCount] = useState(40);
  const [monopolyMode, setMonopolyMode] = useState(false);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState(MASTER_COMPANIES.map(c => c.id));
  const [selectedEventNames, setSelectedEventNames] = useState(EVENTS.map(e => e.name));

  // GAME STATE
  const [teams, setTeams] = useState([]);
  const [companies, setCompanies] = useState([]); 
  const [activeEvents, setActiveEvents] = useState([]);
  
  // ACTION STATE
  const [mode, setMode] = useState('BUY'); 
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [eventToTrigger, setEventToTrigger] = useState('');
  const [selectedCeoName, setSelectedCeoName] = useState('');

  // --- HELPERS ---
  const formatMoney = (amount) => "₹" + Math.round(amount).toLocaleString('en-IN');
  
  // LOGIC: Calculate Portfolio Value with optional Monopoly Bonus
  const getPortfolioValue = (inventory) => {
    const sectorCounts = {};
    inventory.forEach(item => {
      sectorCounts[item.sector] = (sectorCounts[item.sector] || 0) + 1;
    });

    return inventory.reduce((sum, item) => {
      let points = item.points;
      if (monopolyMode && sectorCounts[item.sector] >= 3) {
        points = points * 1.3;
      }
      return sum + points;
    }, 0);
  };

  // --- SHEETDB CONNECTIVITY ---
  const syncFromSheet = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const syncedTeams = data.map(row => ({
        id: parseInt(row.id),
        name: row.name,
        cash: parseInt(row.cash),
        inventory: JSON.parse(row.inventory || "[]"),
        owned_ceos: JSON.parse(row.owned_ceos || "[]")
      }));
      setTeams(syncedTeams);
      alert("Synced successfully!");
    } catch (e) {
      alert("Sync Failed: " + e.message);
    }
    setLoading(false);
  };

  // --- ACTIONS ---
  const toggleCompany = (id) => {
    setSelectedCompanyIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleEvent = (name) => {
    setSelectedEventNames(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  };

  const startGame = () => {
    const newTeams = Array.from({ length: parseInt(teamCount) }, (_, i) => ({
      id: i + 1, name: `Team ${i + 1}`, cash: 1000000, inventory: [], owned_ceos: [] 
    }));
    setTeams(newTeams);
    setCompanies(MASTER_COMPANIES.filter(c => selectedCompanyIds.includes(c.id)));
    setActiveEvents(EVENTS.filter(e => selectedEventNames.includes(e.name)));
    setView('GAME');
  };

  const handleBuyAsset = () => {
    if (!selectedTeamId || !selectedCompanyId || !bidAmount) return alert("Missing Info");
    const teamIdx = teams.findIndex(t => t.id === parseInt(selectedTeamId));
    const company = companies.find(c => c.id === parseInt(selectedCompanyId));
    const cost = parseInt(bidAmount);
    if (teams[teamIdx].cash < cost) return alert("Not enough cash!");

    const newTeams = [...teams];
    newTeams[teamIdx].cash -= cost;
    newTeams[teamIdx].inventory.push({ ...company, boughtAt: cost });
    setTeams(newTeams);
    setBidAmount('');
  };

  const handleBuyCEO = () => {
    if (!selectedTeamId || !selectedCeoName || !bidAmount) return alert("Missing Info");
    const teamIdx = teams.findIndex(t => t.id === parseInt(selectedTeamId));
    const cost = parseInt(bidAmount);
    const ceo = CEOS.find(c => c.name === selectedCeoName);
    if (teams[teamIdx].cash < cost) return alert("Not enough cash!");
    
    const newTeams = [...teams];
    newTeams[teamIdx].cash -= cost;
    newTeams[teamIdx].owned_ceos.push(ceo);
    setTeams(newTeams);
    setBidAmount('');
    alert(`SOLD: ${ceo.name} to ${newTeams[teamIdx].name}`);
  };

  const handleSellBack = () => {
    if (!selectedTeamId || !selectedCompanyId) return alert("Select Team & Asset");
    const teamIdx = teams.findIndex(t => t.id === parseInt(selectedTeamId));
    const team = teams[teamIdx];
    const assetIdx = team.inventory.findIndex(c => c.id === parseInt(selectedCompanyId));
    if (assetIdx === -1) return alert("Asset not found");
    const asset = team.inventory[assetIdx];
    const refund = Math.floor(asset.boughtAt * 0.5);
    const newTeams = [...teams];
    newTeams[teamIdx].cash += refund;
    newTeams[teamIdx].inventory.splice(assetIdx, 1); 
    setTeams(newTeams);
    alert(`REFUNDED: ₹${refund}`);
  };

  const handleTriggerEvent = () => {
    if (!eventToTrigger) return;
    const rule = activeEvents.find(e => e.name === eventToTrigger).rules;
    const newCompanies = companies.map(comp => applyEventMath(comp, rule, 1));
    const newTeams = teams.map(team => {
      const updatedInventory = team.inventory.map(item => {
        const hasCeo = team.owned_ceos.find(ceo => ceo.sector === item.sector);
        return applyEventMath(item, rule, hasCeo ? hasCeo.multiplier : 1);
      });
      return { ...team, inventory: updatedInventory };
    });
    setCompanies(newCompanies);
    setTeams(newTeams);
    alert(`EVENT APPLIED: ${eventToTrigger}`);
  };

  const applyEventMath = (comp, rule, multiplier) => {
    if (rule[comp.sector] || rule['ALL']) {
      let change = rule[comp.sector] || 0;
      if (comp.trait === 'Stable' && change < 0) change = 0;
      if (comp.trait === 'Volatile') change = change * 2;
      change = change * multiplier;
      const newPoints = Math.round(comp.points * (1 + change / 100));
      return { ...comp, points: newPoints };
    }
    return comp;
  };

  // --- RENDER HELPERS ---
  const activeTeam = teams.find(t => t.id === parseInt(selectedTeamId));
  const getAvailableMarketCompanies = () => {
    const ownedIds = new Set();
    teams.forEach(t => t.inventory.forEach(item => ownedIds.add(item.id)));
    return companies.filter(c => !ownedIds.has(c.id));
  };

  if (view === 'SETUP') return (
    <div className="app-container setup-view">
      <h1 className="glitch">STOCKS ARE HIGH // SETUP</h1>
      
      <div className="setup-grid">
        <div className="setup-card">
          <label>TOTAL TEAMS</label>
          <input type="number" value={teamCount} onChange={e => setTeamCount(e.target.value)} className="big-input"/>
          
          <div className="monopoly-toggle" style={{marginTop: '20px', padding: '10px', border: '1px solid #333'}}>
            <label style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <input type="checkbox" checked={monopolyMode} onChange={e => setMonopolyMode(e.target.checked)} style={{width:'20px', height:'20px'}}/>
              ENABLE MONOPOLY BONUS (3+ same sector = 1.3x)
            </label>
          </div>
        </div>

        <div className="setup-card scrollable">
          <h3>SELECT COMPANIES</h3>
          {MASTER_COMPANIES.map(c => (
             <div key={c.id} style={{display:'flex', gap:'10px'}}>
               <input type="checkbox" checked={selectedCompanyIds.includes(c.id)} onChange={() => toggleCompany(c.id)}/>
               <span>{c.name}</span>
             </div>
          ))}
        </div>

        <div className="setup-card scrollable">
          <h3>SELECT EVENTS</h3>
          {EVENTS.map(e => (
             <div key={e.name} style={{display:'flex', gap:'10px'}}>
               <input type="checkbox" checked={selectedEventNames.includes(e.name)} onChange={() => toggleEvent(e.name)}/>
               <span>{e.name}</span>
             </div>
          ))}
        </div>
      </div>

      <button className="start-btn" onClick={startGame}>INITIALIZE SYSTEM</button>
    </div>
  );

  return (
    <div className="app-container">
      <header>
        <div className="brand">COMMAND CENTER {monopolyMode && <span style={{color:'gold', fontSize:'0.8em'}}>[MONOPOLY ACTIVE]</span>}</div>
        <div className="controls">
          <button className="sync-btn" onClick={syncFromSheet} disabled={loading}>{loading ? "..." : "🔄 SYNC"}</button>
          <button className="reset-btn" onClick={() => setView('SETUP')}>⚠ RESET</button>
        </div>
      </header>

      <div className="main-grid">
        <div className="card">
          <h2>TRANSACTION TERMINAL</h2>
          <div className="toggle-box">
            <button className={mode === 'BUY' ? 'active' : ''} onClick={() => setMode('BUY')}>BUY ASSET</button>
            <button className={mode === 'CEO' ? 'active ceo-mode' : ''} onClick={() => setMode('CEO')}>BUY CEO</button>
            <button className={mode === 'SELL' ? 'active sell' : ''} onClick={() => setMode('SELL')}>SELL BACK</button>
          </div>

          <select onChange={e => setSelectedTeamId(e.target.value)} value={selectedTeamId}>
            <option value="">-- Select Team --</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({formatMoney(t.cash)})</option>)}
          </select>

          {mode === 'CEO' ? (
             <>
               <select onChange={e => setSelectedCeoName(e.target.value)}>
                 <option value="">-- Select CEO --</option>
                 {CEOS.map(c => <option key={c.name} value={c.name}>{c.name} ({c.sector} x{c.multiplier})</option>)}
               </select>
               <input type="number" placeholder="CEO Bid" value={bidAmount} onChange={e => setBidAmount(e.target.value)}/>
               <button className="action-btn ceo" onClick={handleBuyCEO}>CONFIRM CEO</button>
             </>
          ) : mode === 'SELL' ? (
             <>
               <select onChange={e => setSelectedCompanyId(e.target.value)}>
                 <option value="">-- Select Asset --</option>
                 {activeTeam ? activeTeam.inventory.map(c => (
                   <option key={c.id} value={c.id}>{c.name} (Bought: {formatMoney(c.boughtAt)})</option>
                 )) : []}
               </select>
               <div className="info-box">
                 REFUND: {selectedCompanyId && activeTeam && activeTeam.inventory.find(c => c.id == selectedCompanyId) 
                   ? formatMoney(activeTeam.inventory.find(c => c.id == selectedCompanyId).boughtAt * 0.5) : "₹0"}
               </div>
               <button className="action-btn sell" onClick={handleSellBack}>CONFIRM SELL</button>
             </>
          ) : (
             <>
               <select onChange={e => setSelectedCompanyId(e.target.value)}>
                 <option value="">-- Available --</option>
                 {getAvailableMarketCompanies().map(c => (
                   <option key={c.id} value={c.id}>{c.name} ({c.points} pts)</option>
                 ))}
               </select>
               <input type="number" placeholder="Bid Amount" value={bidAmount} onChange={e => setBidAmount(e.target.value)}/>
               <button className="action-btn buy" onClick={handleBuyAsset}>CONFIRM BUY</button>
             </>
          )}
        </div>

        <div className="card">
          <h2>MARKET EVENTS</h2>
          <select onChange={e => setEventToTrigger(e.target.value)}>
            <option value="">-- Select Event --</option>
            {activeEvents.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
          </select>
          <button className="action-btn event" onClick={handleTriggerEvent}>TRIGGER EVENT</button>
        </div>
      </div>

      <div className="leaderboard-section">
        <h3>LIVE RANKINGS</h3>
        <table>
          <thead><tr><th>Rank</th><th>Team</th><th>Cash</th><th>CEOs</th><th>Assets</th><th>Portfolio Pts</th></tr></thead>
          <tbody>
            {[...teams]
              .map(t => ({ ...t, portValue: getPortfolioValue(t.inventory) }))
              .sort((a,b) => b.portValue - a.portValue)
              .map((t, idx) => (
                <tr key={t.id} className={idx < 3 ? 'top-rank' : ''}>
                  <td>#{idx + 1}</td><td>{t.name}</td>
                  <td className="num">{formatMoney(t.cash)}</td>
                  <td className="tiny-text">{t.owned_ceos.map(c => c.sector.substring(0,3)).join(', ')}</td>
                  {/* NEW COLUMN SHOWING ASSETS */}
                  <td className="tiny-text" style={{maxWidth:'200px', fontSize:'0.75rem', color:'#8b949e'}}>
                    {t.inventory.length > 0 ? t.inventory.map(c => c.name).join(', ') : '-'}
                  </td>
                  <td className="num total">{Math.round(t.portValue)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
