namespace GameCubeOnline.Helpers
{
    interface Builder<T> where T : class { public T buildInit(); }

    class BuilderWarning<T> where T : class
    {
        protected static bool myEnableSuggestedWarnings = false;
        public static bool EnableSuggestedWarnings { set => myEnableSuggestedWarnings = value; }
        public List<string> mySuggestedWarnings;
        public List<string> myRequiredWarnings;
        public BuilderWarning()
        {
            mySuggestedWarnings = new List<string>();
            myRequiredWarnings = new List<string>();
        }

        protected BuilderWarning<T> warning(List<string> aWarningContainer, string aFunctionName, string aNote = "")
        {
            string theWarningString = $"For instance of class {typeof(T).Name}, it is suggested that you call {aFunctionName} to set the corresponding parameter.";
            if (aNote != "") theWarningString += $"\n Note:{aNote}";
            aWarningContainer.Add(theWarningString);
            return this;
        }

        public BuilderWarning<T> suggests(bool aCondition, string aFunctionName, string aNote = "") => myEnableSuggestedWarnings && !aCondition ? warning(mySuggestedWarnings, aFunctionName, aNote) : this;

        public BuilderWarning<T> requires(bool aCondition, string aFunctionName, string aNote = "") => !aCondition ? warning(myRequiredWarnings, aFunctionName, aNote) : this;

        public BuilderWarning<T> enforce()
        {
            foreach (var aRequiredWarning in myRequiredWarnings) throw new Exception(aRequiredWarning);
            foreach (var aSuggestedWarning in mySuggestedWarnings) Console.WriteLine(aSuggestedWarning);
            if (myEnableSuggestedWarnings) Console.WriteLine($"Total Warnings: {mySuggestedWarnings.Count}");
            return this;
        }

    }
}
