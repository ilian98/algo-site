vector <int> a[MAXN];
bool used[MAXN];
int in[MAXN],time;
int up[MAXN];
void dfs (int vr, int fath) {
    used[vr]=true;
    in[vr]=time++;
    up[vr]=in[vr];
    int flag=0;
    for (auto to : a[vr]) {
        if (used[to]==false) { /// дървесно ребро
            dfs(to,vr);
            up[vr]=min(up[vr],up[to]);
            if (up[to]>=in[vr]) flag++;
        }
        else if (to!=fath) { /// обратно ребро
            up[vr]=min(up[vr],in[to]);
        }
    }
    if (fath==-1) { /// vr е коренът
        if (flag>1) cout << vr << endl ;
    }
    else {
        if (flag>0) cout << vr << endl ;
    }
}
