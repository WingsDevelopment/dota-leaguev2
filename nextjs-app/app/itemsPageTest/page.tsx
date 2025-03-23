import { getItemImage } from "@/lib/utils"
import { itemMap } from "../matchHistory/[id]/hero_and_items_images"
export default function ItemList() {
    return (
        <div>
            {Object.entries(itemMap).map(([key, value]) => (
                <div key={key}>
                    <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/items/${value}_lg.png`} width={100}/>
                    {key}: {value}
                </div>
            ))}
        </div>
    );
}