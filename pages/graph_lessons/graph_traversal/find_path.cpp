vector <int> a[MAXN];
bool visited[MAXN];
stack <int> path;
bool dfs (int vr, int fin) {
    visited[vr]=true;
    if (vr==fin) {
        path.push(vr);
        return true;
    }
    for (auto to : a[vr]) {
        if (visited[to]==false) {
            if (dfs(to,fin)==true) {
                path.push(vr);
                return true;
            }
        }
    }
    return false;
}
int main () {
    /// Въвеждаме графа и попълваме списъка на съседите
    int x,y;
    cin >> x >> y ;
    dfs(x,y);
    while (!path.empty()) {
        cout << path.top() << " ";
        path.pop();
    }
    cout << endl ;
}
