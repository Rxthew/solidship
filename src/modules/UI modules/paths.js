const recordPathHelpers = function(){

    const addNewPath = function(obj, currentPath, prop, paths){
        let first = obj
        if(currentPath){
            for(let elem of currentPath){
                if(elem === currentPath[currentPath.length - 1]){
                    paths.push([...currentPath, prop])
                }
                first = first[elem]
            } 
        }
        else{
            paths.push([prop])

        }
    }

    const initialInjection = function(obj,paths){
        for(let elem of Object.keys(obj)){
            addNewPath(obj,null,elem,paths)
        }
    }

    const finalisePath = function(obj,paths,confirmedPaths){
        let first = obj
            for(let path of paths){
                for(let elem of path){
                    if(elem === path[path.length - 1]){
                        if(Array.isArray(first[elem]) || typeof first[elem] === 'string' || typeof first[elem] === 'number'){
                             confirmedPaths = [...confirmedPaths, path]
                             delete paths[paths.indexOf(path)]      
                        }
                        else if(typeof first[elem] === 'object'){
                            let newCheckPoints = Object.keys(first[elem])
                            for(let checkPoint of newCheckPoints){
                                addNewPath(obj,path,checkPoint,paths)
                            }
                            delete paths[paths.indexOf(path)]
                        }
                    }
                    first = first[elem]
                }
                first = obj
            }
            paths = paths.filter(path => path !== undefined)
            return  confirmedPaths 
    }

    const chartPath = function(event, initParent='viewConsole', propTitle='propertyTitle'){
        let parent = event.target.parentElement
        let prop = event.target.id
        let path = [prop]
        while(parent !== document.querySelector(`.${initParent}`)){
            if(parent === document.querySelector('main')){
                return
            }
            parent = parent.parentElement
            let children = Array.from(parent.children)
            children = children.filter(child => child.classList.contains(`${propTitle}`))
            if(children.length === 0){
                return path
            } 
            path.unshift(children[0].id)      
        }
        return path
    }    
    return {
        addNewPath,
        initialInjection,
        finalisePath,
        chartPath
    }

}

export default recordPathHelpers
