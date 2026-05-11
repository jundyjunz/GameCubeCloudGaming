using Microsoft.Extensions.ObjectPool;
using System.Runtime.CompilerServices;

namespace GameCubeOnline.Helpers
{
    public class Factory<T> where T : class
    {
        private static Factory<T> myInstance = null;
        private Dictionary<string, Func<object[],T>> myMakers; 
        private static Factory<T> Instance {  
            get {  
                if (myInstance == null) myInstance = new Factory<T>();  
                return myInstance;
            }  
        }

        public Factory() { myMakers=new Dictionary<string, Func<object[],T>>(); }

        public static T make(string aMakerKey, params object[] aArgs) {
            if (Instance.myMakers.ContainsKey(aMakerKey)) return Instance.myMakers[aMakerKey](aArgs);
            else throw new Exception($"{aMakerKey} Does Not Exist In {typeof(T).Name} Factory!");
        }

        public interface Registry<U> where U : T{
            public static void register(Func<object[],T> aFunc) => Instance.myMakers.Add(typeof(U).Name, aFunc);
        } 
    }
}
