import { Users, Trophy, FileText, User, LayoutDashboard, LogOut, PenSquare, ClipboardCheck, UserCog, Search, BarChart3 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const { profile, logout, isAdmin, isInfluencer } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const adminMenuItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Influenciadores', url: '/influenciadores', icon: Users },
    { title: 'Conteúdos', url: '/conteudos', icon: PenSquare },
    { title: 'Avaliação de Performance', url: '/avaliacao', icon: ClipboardCheck },
    { title: 'Ranking', url: '/ranking', icon: Trophy },
    { title: 'Documentos', url: '/documentos', icon: FileText },
    { title: 'Prospecção', url: '/prospeccao', icon: Search },
    { title: 'Análise de Métricas', url: '/analise-metricas', icon: BarChart3 },
    { title: 'Usuários', url: '/usuarios', icon: UserCog },
  ];

  const influencerMenuItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Conteúdos do Mês', url: '/conteudos', icon: PenSquare },
    { title: 'Ranking', url: '/ranking', icon: Trophy },
    { title: 'Documentos', url: '/documentos', icon: FileText },
    { title: 'Meu Perfil', url: '/meu-perfil', icon: User },
  ];

  const menuItems = isInfluencer ? influencerMenuItems : adminMenuItems;

  const getRoleLabel = () => {
    if (isAdmin) return 'Administrador';
    if (isInfluencer) return 'Influenciador';
    return 'Usuário';
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <img src="/logo-branca.svg" alt="LM" className="h-10 w-auto" />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                Liberdade Médica
              </span>
              <span className="text-xs text-muted-foreground">
                {isAdmin ? 'Portal Admin' : 'Portal Creator'}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
            <User className="h-5 w-5 text-sidebar-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                {profile?.name || 'Usuário'}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {getRoleLabel()}
              </span>
            </div>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
