
const { ccclass, property, requireComponent } = cc._decorator;


@ccclass
export default class Astar extends cc.Component {
    @property(cc.Integer)
    wcount: number = 10;
    @property(cc.Integer)
    hcount: number = 10;

    @property(cc.SpriteFrame)
    sp: cc.SpriteFrame = null;
    protected nodes: cc.Node[][] = [];

    @property(cc.Node)
    startNode: cc.Node = null;

    @property(cc.Node)
    endNode: cc.Node = null;
    protected start(): void {
        console.log(`${this.wcount}-${this.hcount}`)
        const widthUnit = this.node.width / this.wcount;
        const heightUnit = this.node.height / this.hcount;
        const sx = -(this.node.width / 2) + widthUnit / 2;
        const sy = this.node.height / 2 - heightUnit / 2;
        for (let h = 0; h < this.hcount; h++) {
            let y = sy - (h * heightUnit);
            const arr = [];
            for (let l = 0; l < this.wcount; l++) {
                const nn = new cc.Node(`${h + 1}_${l + 1}`);
                nn.width = widthUnit;
                nn.height = heightUnit;
                const nnchild = new cc.Node('img');
                nnchild.width = (nn.width - 2);
                nnchild.height = (nn.height - 2);
                const sprite = nnchild.addComponent(cc.Sprite);
                sprite.type = cc.Sprite.Type.SIMPLE;
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                sprite.spriteFrame = this.sp;
                this.node.addChild(nn);
                nn.addChild(nnchild);
                nnchild.setPosition(cc.v2());
                let x = sx + (l * widthUnit);
                if (h == 0) console.log(x);
                nn.x = x;
                nn.y = y;
                arr.push(nn);
            }
            this.nodes.push(arr);
        }
        this.node.on(cc.Node.EventType.TOUCH_START, this._touchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this._touchEnd, this)
        this.startNode.width = widthUnit;
        this.endNode.width = widthUnit;
        this.startNode.height = heightUnit;
        this.endNode.height = heightUnit;
        this._setStartOrEndPos(this.startNode, this.nodes[0][0]);
        this._setStartOrEndPos(this.endNode, this.nodes[this.nodes.length - 1][this.nodes[0].length - 1]);
    }

    private _setStartOrEndPos(dst: cc.Node, src: cc.Node) {
        const wpos = src.parent.convertToWorldSpaceAR(src.getPosition().clone());
        const lpos = dst.parent.convertToNodeSpaceAR(wpos);
        dst.setPosition(lpos);
    }

    private _preNode: cc.Node = null;
    private _touchMove(evt: cc.Event.EventTouch) {
        const wpos = evt.getLocation();
        const lpos = this.node.convertToNodeSpaceAR(wpos);
        let h = 0;
        while (h < this.hcount) {
            const nnn = this.nodes[h][0]
            if (lpos.y >= (nnn.y - nnn.height / 2) && lpos.y <= (nnn.y + nnn.height / 2)) break;
            h++;
        }

        const find = this.nodes[h].find(vv => {
            return vv.getBoundingBox().contains(lpos);
        })
        if (!find) return;
        if (this._preNode != find) {
            find.active = !find.active;
            this._preNode = find;
        }

    }

    private _touchEnd(evt: cc.Event.EventTouch) {
        this._touchMove(evt);
        this._preNode = null;
    }

    onClickFindPath() {
        let matrix: number[][] = [];
        this.nodes.forEach((arr, li) => {
            const varr = [];
            arr.forEach(v => {
                varr.push(v.active ? 1 : 0);
            })
            matrix.push(varr);
        })


        const graph = new Graph(matrix);
        const path = astar.search(graph, graph.grid[0][0], graph.grid[this.nodes.length - 1][this.nodes[0].length - 1]);
        let i = 0;
        while (path && path.length > i) {
            const node = this.nodes[path[i].x][path[i].y];
            node.getChildByName("img").color = cc.Color.GRAY;
            i++;
        }
        if (path.length == 0) {
            console.log("不存在路劲")
        }
    }


    onClickReset() {
        this.nodes.forEach((arr, li) => {
            const varr = [];
            arr.forEach(v => {
                v.active = true;
                v.getChildByName("img").color = cc.Color.WHITE;
            })
        })
    }

}
