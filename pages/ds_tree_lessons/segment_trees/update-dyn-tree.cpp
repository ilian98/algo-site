#define MAXNUM 1000000000
#define MAXQ 100000
#define LOGQ 20
struct vertex {
    int l,r;
    int cnt;
};
vertex tree[MAXQ*LOGQ];
int curr=2;
void update (int ind, int l, int r, int c) {
    if (l==r) {
        tree[ind].cnt++;
        return ;
    }
    int mid=(l+r)/2;
    if (c<=mid) {
        if (tree[ind].l==0) tree[ind].l=curr++; // добавяме ляво дете
        update(tree[ind].l,l,mid,c);
    }
    else {
        if (tree[ind].r==0) tree[ind].r=curr++; // добавяме дясно дете
        update(tree[ind].r,mid+1,r,c);
    }
    tree[ind].cnt=0;
    if (tree[ind].l!=0) tree[ind].cnt+=tree[tree[ind].l].cnt;
    if (tree[ind].r!=0) tree[ind].cnt+=tree[tree[ind].r].cnt;
}