find . -name "*.class" | xargs rm
find . -name "*.java" | xargs javac
find . -name "*.class" | xargs jar cvfm zeega-solr-0.2.jar manifest.txt