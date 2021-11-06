vector <int> a[MAXN]; /// списък на съседите
int used[MAXN];
int in[MAXN],time;
int up[MAXN];
void dfs (int vr, int fath) {
    used[vr]=true;
    in[vr]=time++;
    up[vr]=in[vr];
    for (auto to : a[vr]) {
        if (used[to]==false) { /// дървесно ребро
            dfs(to,vr);
            if (up[to]>=in[to]) cout << vr << " " << to << endl ; /// мост

            up[vr]=min(up[vr],up[to]);
        }
        else if (to!=fath) { /// обратно ребро
            up[vr]=min(up[vr],in[to]);
        }
    }
}
