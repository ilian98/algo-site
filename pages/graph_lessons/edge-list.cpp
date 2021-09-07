int edges[MAXM][2],len=0;
int prev[MAXM],last[MAXN];
void add_edge (int x, int y) {
    edges[len][0]=x; edges[len][1]=y;
    prev[len]=last[x];
    last[x]=len;
    len++;
}
int main () {
    int n,m;
    cin >> n >> m ;
    for (int i=0; i<n; i++) {
        last[i]=-1;
    }
    int x,y;
    for (int i=1; i<=m; i++) {
        cin >> x >> y ;
        x--; y--; /// Правим номерацията на върховете от 0 до \(n-1\)
        add_edge(x,y);
    }
    for (int ind=last[0]; ind!=-1; ind=prev[ind]) { /// 0 съответства на връх 1
        cout << edges[ind][1] << " "; /// edges[ind][0] е 0 и edges[ind][1] е съседа на връх 0 за това ребро
    }
    cout << endl ;
    return 0;
}
