import { Routes } from '@angular/router';

import { Home } from './pages/home/home';

import { Digimon } from './pages/digimon/digimon';
import { Dbz } from './pages/dbz/dbz';
import { Pokemon } from './pages/pokemon/pokemon';
import { DemonSlayer } from './pages/demon-slayer/demon-slayer';

import { CharacterExplorer } from './pages/character-explorer/character-explorer';
import { CharacterDetail } from './pages/character-detail/character-detail';

export const routes: Routes = [
{
path: '',
component: Home,
title: 'Inicio | Biela Santizo'
},
{
path: 'explorer/digimon',
component: Digimon,
title: 'Digimon | Biela Santizo'
},
{
path: 'explorer/dbz',
component: Dbz,
title: 'Dragon Ball Z | Biela Santizo'
},
{
path: 'explorer/pokemon',
component: Pokemon,
title: 'Pokémon | Biela Santizo'
},
{
path: 'explorer/demon-slayer',
component: DemonSlayer,
title: 'Demon Slayer | Biela Santizo'
},
{
path: 'explorer/:universe',
component: CharacterExplorer,
title: 'Explorador de personajes | Biela Santizo'
},
{
path: 'character/:universe/:id',
component: CharacterDetail,
title: 'Detalle del personaje | Biela Santizo'
},
{
path: '**',
redirectTo: ''
}
];
