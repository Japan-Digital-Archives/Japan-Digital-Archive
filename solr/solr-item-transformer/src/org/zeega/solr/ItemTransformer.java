// 
// Decompiled by Procyon v0.5.30
// 

package org.zeega.solr;

/**
 * Solr is configured to use this code during import of MySql data.
 * A couple columns in the MySql table are stored as serialized php object.
 * This code converts them to plain text before sending them to Solr.
 */

import org.lorecraft.phparser.SerializedPhpParser;
import java.util.Map;

public class ItemTransformer
{
    public Object transformRow(final Map<String, Object> row) 
    {
        final String tags = (String)row.get("tags");
        if (tags != null)
	{
            final SerializedPhpParser serializedPhpParser = new SerializedPhpParser(tags);
	    Object tmp = serializedPhpParser.parse();
	    if (tmp != null && tmp != SerializedPhpParser.NULL) 
	    {
		try
		{
		    final Map<Object, Object> res = (Map<Object, Object>)tmp;
		    row.put("tags", res.values());
		}
		catch (Exception e)
		{
		    System.out.println("exception in ItemTransformer.transformRow with tags: " + e);
		    System.out.println("  parsed tags = " + tmp);
		}
	    }
        }
        final String attributes = (String)row.get("attributes");
        if (attributes != null)
	{
            final SerializedPhpParser serializedPhpParser2 = new SerializedPhpParser(attributes);
	    Object tmp2 = serializedPhpParser2.parse();
	    if (tmp2 != null  && tmp2 != SerializedPhpParser.NULL) 
	    {
		try
		{
		    final Map<Object, Object> res2 = (Map<Object, Object>)tmp2;
		    row.put("attributes", res2);
		}
		catch (Exception e2)
   	        {
		    System.out.println("exception in ItemTransformer.transformRowwith attributes: " + e2);
		    System.out.println("  parsed attributes = " + tmp2);
		}

	    }
        }
        return row;
    }
}
