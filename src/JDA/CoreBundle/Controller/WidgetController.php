<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

use Monolog\Logger;
use Monolog\Formatter\NormalizerFormatter;

class WidgetController extends Controller
{
    
  public function openAction()
  {
    $logger = $this->get('logger');
    $formatter = new NormalizerFormatter();
    
    $locale=$this->getRequest()->getLocale();
    $user = $this->get('security.context')->getToken()->getUser();
    if(is_object($user)){
      $displayName = $user->getDisplayName();
      $userId = $user->getId();
    }
    else{
      $displayName='none';
      $userId=0;	
    }

    $message = $formatter->format(array($user, "message"=>"log", 'context' => array('from' => 'logger'), "extra"=>"ext"));
    $logger->info($userId);
    
    $em = $this->getDoctrine()->getEntityManager();
    $request = $this->getRequest();
    $session = $request->getSession();
    
    $logger->info(print_r($session, true));
            
    $widgetId = $request->query->get('widget-id');
    $itemUrl = $request->query->get('url');
	$itemTitle = $request->query->get('title');
    
    $parserResponse = $this->forward('JDACoreBundle:Item:getItemsParser', array(), array("url" => $itemUrl))->getContent();
  
    $parserResponse = json_decode($parserResponse,true);
    $message = "SORRY! We can't add this item.";	

    $isUrlValid = $parserResponse["request"]["success"];
    $isUrlCollection = $parserResponse["request"]["is_set"];
    $message = $parserResponse["request"]["message"];
    $items = $parserResponse["items"];

    $parsedItem = $items[0];
    
    return $this->render('JDACoreBundle:Widget:widget.html.twig', array(
					'page'=> 'user',
					'displayname'=>$displayName,
					'userId'=>$userId,
                    'widget_id'=>$widgetId,
                    'item'=>json_encode($parsedItem), 
                    'update'=>0,
                   	'archive'=>$parsedItem["archive"],
                    'thumbnail_url'=>$itemUrl,
                    'child_items_count'=>$parsedItem["child_items_count"],
                    'parent_url'=>$itemUrl,
                    'title'=>$itemTitle	
				));
  }
    
	public function persistAction()
  {
    $request = $this->getRequest();

    $itemUrl = $request->request->get('thumbnail_url');

    $isQueueingEnabled = $this->container->getParameter('queueing_enabled');
		
		return $this->forward('ZeegaApiBundle:Items:postItems', array(), array());
  }
}
